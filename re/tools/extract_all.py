
# -*- coding: utf-8 -*-
"""Extract every non-infringing fact we can from the sample APK into ./re/*.json|.csv
   No artwork / audio / text content is exported: only names, counts, offsets, hashes, structure."""
import zipfile, struct, json, csv, re, hashlib, os, sys

APK = os.environ.get("KZ_APK", r"C:\Users\zhongwen_guan\.dsh\attachments\v1\files\0f\0fa4000a45a181368047d3a19edcdd9a0181effd2eb9bfbacd7112f3287e9413\com.netflix.NGP.KatanaZero.apk")
OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.makedirs(OUT, exist_ok=True)

def w(name, obj):
    p = os.path.join(OUT, name)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
    print("wrote", name, os.path.getsize(p), "B")

z = zipfile.ZipFile(APK)
infos = z.infolist()
sha = hashlib.sha256(open(APK, "rb").read()).hexdigest()

# ---------- 1. members.csv ----------
with open(os.path.join(OUT, "members.csv"), "w", newline="", encoding="utf-8") as f:
    wr = csv.writer(f)
    wr.writerow(["name", "size", "compressed", "crc32", "compress_type"])
    for i in infos:
        wr.writerow([i.filename, i.file_size, i.compress_size, "%08x" % i.CRC, i.compress_type])
print("wrote members.csv", os.path.getsize(os.path.join(OUT, "members.csv")), "B")

# ---------- 2. package identity ----------
big = sorted(infos, key=lambda i: -i.file_size)[:20]
ident = {
    "apk": {"sha256": sha, "bytes": len(open(APK, "rb").read()), "members": len(infos)},
    "note": "APK 本体不入库（>100MB 且为第三方重打包样本）。此文件只记录身份与结构，可凭 sha256 复核。",
    "dex": [{"name": i.filename, "size": i.file_size} for i in infos if i.filename.endswith(".dex")],
    "native_libs": [{"name": i.filename, "size": i.file_size} for i in infos if i.filename.endswith(".so")],
    "largest_members": [{"name": i.filename, "size": i.file_size} for i in big],
    "signature": {},
}
try:
    from cryptography import x509
    from cryptography.hazmat.primitives import hashes
    data = open(APK, "rb").read()
    eocd = data.rfind(b"PK\x05\x06")
    cd_off = struct.unpack("<I", data[eocd + 16:eocd + 20])[0]
    blk = struct.unpack("<Q", data[cd_off - 24:cd_off - 16])[0]
    start = cd_off - blk - 8
    p = start + 8
    vals = {}
    while p < cd_off - 24:
        ln = struct.unpack("<Q", data[p:p + 8])[0]
        bid = struct.unpack("<I", data[p + 8:p + 12])[0]
        vals[bid] = data[p + 12:p + 8 + ln]
        p += 8 + ln
    def lp(b, o):
        n = struct.unpack("<I", b[o:o + 4])[0]
        return b[o + 4:o + 4 + n], o + 4 + n
    certs = []
    for bid, label in ((0x7109871A, "v2"), (0xF05368C0, "v3")):
        if bid not in vals: continue
        signers_seq, _ = lp(vals[bid], 0)
        signer, _ = lp(signers_seq, 0)
        sd, _ = lp(signer, 0)
        digests, q = lp(sd, 0)
        cert_blob, q = lp(sd, q)
        k = 0
        while k < len(cert_blob):
            der, k = lp(cert_blob, k)
            c = x509.load_der_x509_certificate(der)
            certs.append({"scheme": label, "subject": c.subject.rfc4514_string(),
                          "issuer": c.issuer.rfc4514_string(),
                          "sha256": c.fingerprint(hashes.SHA256()).hex(),
                          "not_before": str(c.not_valid_before_utc), "not_after": str(c.not_valid_after_utc)})
    # v1 (JAR) 证书
    try:
        from cryptography.hazmat.primitives.serialization import pkcs7
        for nm in z.namelist():
            if nm.upper().startswith("META-INF/") and nm.upper().endswith((".RSA", ".DSA", ".EC")):
                for c in pkcs7.load_der_pkcs7_certificates(z.read(nm)):
                    certs.append({"scheme": "v1", "subject": c.subject.rfc4514_string(),
                                  "issuer": c.issuer.rfc4514_string(),
                                  "sha256": c.fingerprint(hashes.SHA256()).hex(),
                                  "not_before": str(c.not_valid_before_utc), "not_after": str(c.not_valid_after_utc)})
    except Exception as e:
        certs.append({"scheme": "v1", "error": str(e)[:120]})
    ident["signature"] = {"schemes_present": sorted(set(c["scheme"] for c in certs)), "certs": certs}
except Exception as e:
    ident["signature"] = {"error": str(e)[:200]}
w("package-identity.json", ident)

# ---------- 3. game.droid chunks ----------
d = z.read("assets/assets/game.droid")
def u32(o): return struct.unpack("<I", d[o:o + 4])[0]
chunks = []
o = 0x3E0
while o + 8 <= len(d):
    nm = d[o:o + 4]
    if not re.fullmatch(rb"[A-Za-z0-9]{4}", nm): break
    sz = u32(o + 4)
    if sz > len(d): break
    chunks.append({"name": nm.decode(), "offset": o + 8, "size": sz})
    o += 8 + sz
w("game-droid-chunks.json", {"file_bytes": len(d), "header": "FORM..GEN8", "chunk_table_offset": 0x3E0,
                             "chunks": chunks, "ends_at": o, "covers_file": o == len(d)})
cmap = {c["name"]: (c["offset"], c["size"]) for c in chunks}

def cstr(p):
    if not (0 < p < len(d)): return None
    e = d.find(b"\x00", p, p + 300)
    if e < 0: return None
    try: s = d[p:e].decode("utf-8")
    except Exception: return None
    return s if s and all(ord(c) >= 32 for c in s) else None
def name_of(structptr):
    s = cstr(u32(structptr))
    return s or cstr(structptr)
def names(cn, cap=20000):
    off, sz = cmap[cn]
    c = u32(off); out = []
    for i in range(min(c, cap)):
        s = name_of(u32(off + 4 + 4 * i))
        if s: out.append(s)
    return out

names_all = {}
for cn in ("SPRT", "BGND", "OBJT", "ROOM", "SCPT", "SOND", "FONT", "SHDR", "TMLN", "PATH"):
    if cn in cmap: names_all[cn] = names(cn)
w("asset-names.json", {k: {"count": len(v), "names": v} for k, v in names_all.items()})

# ---------- 4. rooms + layers ----------
roff = cmap["ROOM"][0]
rooms = []
for i in range(u32(roff)):
    rp = u32(roff + 4 + 4 * i)
    nm = cstr(u32(rp)) or cstr(rp)
    wdt, hgt = u32(rp + 8), u32(rp + 12)
    layers = []
    lh = u32(rp + 52)
    if 0 < lh < len(d):
        base = lh + 4
        lc = u32(base)
        if 0 < lc < 200:
            for k in range(lc):
                lp2 = u32(base + 4 + 4 * k)
                if not (0 < lp2 < len(d)): continue
                lname = cstr(u32(lp2))
                layers.append({"name": lname, "id": u32(lp2 + 4), "type": u32(lp2 + 8),
                               "depth": struct.unpack("<i", d[lp2 + 12:lp2 + 16])[0],
                               "visible": u32(lp2 + 32), "instances": u32(lp2 + 48)})
    rooms.append({"index": i, "name": nm, "width": wdt, "height": hgt, "layers": layers})
w("rooms.json", {"count": len(rooms), "rooms": rooms})

# ---------- 5. GML 符号（libyoyo） ----------
yo = z.read("lib/arm64-v8a/libyoyo.so")
gml = sorted(set(m.group(0).decode("ascii") for m in re.finditer(rb"gml_[A-Za-z0-9_]{2,160}", yo)))
obj_events = {}
for n in gml:
    m = re.match(r"gml_Object_([A-Za-z0-9_]+?)_([A-Za-z]+)_(\d+)$", n)
    if m: obj_events.setdefault(m.group(1), set()).add(m.group(2))
w("gml-symbols.json", {
    "total_gml_names": len(gml),
    "objects": {k: sorted(v) for k, v in obj_events.items()},
    "scripts": [n[11:] for n in gml if n.startswith("gml_Script_")],
    "global_scripts": [n[17:] for n in gml if n.startswith("gml_GlobalScript_")],
})

print("done ->", OUT)
