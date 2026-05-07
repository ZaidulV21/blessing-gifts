// src/pages/admin/AdminProducts.jsx
// Images: Cloudinary (free alternative to backend storage)
// Products: API-backed CRUD

import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, X, Upload, Loader, ExternalLink } from "lucide-react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../../services/api";
import toast from "react-hot-toast";

const CATEGORIES = ["Toy Cars", "Showpieces", "Soft Toys", "Gift Sets"];

const EMPTY_FORM = {
  name: "", category: "Toy Cars", price: "", mrp: "",
  description: "", badge: "", inStock: true,
  features: "", imageUrl: "", images: "",
};

const toastCfg = {
  style: {
    background: "#111010", color: "#fff",
    fontFamily: "'Jost', sans-serif", fontSize: "0.82rem",
    borderLeft: "2px solid #B8912A", borderRadius: "2px",
  },
};

// ── CLOUDINARY UPLOAD ─────────────────────────────────────────
// Cloudinary credentials from environment variables
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

const uploadToCloudinary = async (file) => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary not configured. Add REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET to .env"
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Upload failed");
  }

  const data = await res.json();
  return data.secure_url; // This is the permanent image URL
};

// ─────────────────────────────────────────────────────────────
export default function AdminProducts() {
  const [products, setProducts]           = useState([]);
  const [selectedRelated, setSelectedRelated] = useState([]); // array of product objects
  const [relatedQuery, setRelatedQuery] = useState("");
  const [loading, setLoading]             = useState(true);
  const [backendReady, setBackendReady]   = useState(false);
  const [showForm, setShowForm]           = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [imageFile, setImageFile]         = useState(null);
  const [imagePreview, setImagePreview]   = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving]               = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab]         = useState("upload"); // "upload" | "url"
  const fileRef = useRef();
  const addFilesRef = useRef();
  const [additionalUploadedUrls, setAdditionalUploadedUrls] = useState([]);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);

  // ── Check backend on mount ────────────────────────────────
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const list = await getProducts();
      setProducts(list);
      setBackendReady(true);
    } catch (err) {
      setBackendReady(false);
      toast.error("Load failed: " + err.message, toastCfg);
    }
    setLoading(false);
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
    setActiveTab("upload");
    setSelectedRelated([]);
    setAdditionalUploadedUrls([]);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({
      name:        p.name        || "",
      category:    p.category    || "Toy Cars",
      price:       p.price       || "",
      mrp:         p.mrp         || "",
      description: p.description || "",
      badge:       p.badge       || "",
      inStock:     p.inStock !== false,
      features:    Array.isArray(p.features)
        ? p.features.join(", ")
        : (p.features || ""),
      imageUrl:    p.imageUrl    || "",
      images:      Array.isArray(p.images) ? p.images.join(", ") : (p.images || ""),
      related:     Array.isArray(p.related) ? p.related.join(",") : (p.related || ""),
    });
    setImageFile(null);
    setImagePreview(p.imageUrl || "");
    setEditingId(p.id);
    setActiveTab(p.imageUrl ? "url" : "upload");
    setAdditionalUploadedUrls([]);
    // prefill selected related products as objects
    const sel = Array.isArray(p.related) && p.related.length > 0
      ? p.related.map((rid) => products.find((pp) => String(pp.id) === String(rid))).filter(Boolean)
      : [];
    setSelectedRelated(sel);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");
    setAdditionalUploadedUrls([]);
  };

  // ── Image pick (local preview only) ──────────────────────
  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB", toastCfg);
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    set("imageUrl", ""); // clear manual URL
    set("images", "");
  };

  // ── Multiple additional images (max total 5) ─────────────────
  const handleAdditionalFilesPick = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // auto-upload if Cloudinary configured
    if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_CLOUD_NAME !== "YOUR_CLOUD_NAME") {
      setUploadingAdditional(true);
      try {
        const canAdd = 5 - additionalUploadedUrls.length;
        const toUpload = files.slice(0, Math.max(canAdd, 0));
        for (const file of toUpload) {
          const url = await uploadToCloudinary(file);
          setAdditionalUploadedUrls((prev) => [...prev, url].slice(0, 5));
        }
        toast.success(`Uploaded ${toUpload.length} additional image${toUpload.length !== 1 ? "s" : ""}`, toastCfg);
      } catch (err) {
        toast.error("Upload failed: " + err.message, toastCfg);
      }
      setUploadingAdditional(false);
    } else {
      toast("Enable Cloudinary to upload images", { ...toastCfg, duration: 3000 });
    }

    // clear input value to allow re-pick of same files
    if (addFilesRef.current) addFilesRef.current.value = "";
  };

  const removeAdditionalAt = (index) => {
    setAdditionalUploadedUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Upload image to Cloudinary ────────────────────────────
  const handleUploadNow = async () => {
    if (!imageFile) {
      toast.error("Pick an image first", toastCfg);
      return;
    }
    setUploadingImage(true);
    try {
      const url = await uploadToCloudinary(imageFile);
      set("imageUrl", url);
      setImagePreview(url);
      setImageFile(null);
      toast.success("Image uploaded! ✓", toastCfg);
    } catch (err) {
      toast.error("Upload failed: " + err.message, toastCfg);
    }
    setUploadingImage(false);
  };

  // ── Save product ──────────────────────────────────────────
  const handleSave = async () => {
    if (!backendReady) {
      toast.error("Backend not connected. Check MONGO_URI and API_URL.", toastCfg);
      return;
    }

    // Validation
    if (!form.name.trim())        { toast.error("Product name is required", toastCfg); return; }
    if (!form.price)              { toast.error("Selling price is required", toastCfg); return; }
    if (!form.mrp)                { toast.error("MRP is required", toastCfg); return; }
    if (!form.description.trim()) { toast.error("Description is required", toastCfg); return; }

    // If file selected but not yet uploaded to Cloudinary, upload now
    let finalImageUrl = form.imageUrl.trim();
    if (imageFile && !finalImageUrl) {
      setUploadingImage(true);
      try {
        finalImageUrl = await uploadToCloudinary(imageFile);
        setUploadingImage(false);
      } catch (err) {
        setUploadingImage(false);
        toast.error("Image upload failed: " + err.message, toastCfg);
        return;
      }
    }

    if (!finalImageUrl && !editingId) {
      toast.error("Add an image — upload a file or paste an image URL", toastCfg);
      return;
    }

    setSaving(true);
    try {
      const data = {
        name:        form.name.trim(),
        category:    form.category,
        price:       Number(form.price),
        mrp:         Number(form.mrp),
        description: form.description.trim(),
        badge:       form.badge || null,
        inStock:     form.inStock,
        features:    form.features
          ? form.features.split(",").map((f) => f.trim()).filter(Boolean)
          : [],
        image:       finalImageUrl,
        imageUrl:    finalImageUrl,
        images: (() => {
          const pasted = form.images
            ? form.images.split(/[,\n]/).map((img) => img.trim()).filter(Boolean)
            : [];
          const combined = [finalImageUrl, ...(additionalUploadedUrls || []), ...pasted]
            .filter(Boolean)
            .filter((image, index, array) => array.indexOf(image) === index);
          return combined.slice(0, 5);
        })(),
          related:     selectedRelated.map((r) => r.id),
        stock:       form.inStock ? 10 : 0,
        inStock:     form.inStock,
      };

      if (editingId) {
        await updateProduct(editingId, data);
        toast.success("✓ Product updated!", toastCfg);
      } else {
        console.log("[Save] Creating product with data:", { images: data.images, related: data.related, additionalUploadedUrls });
        await createProduct({
          ...data,
          rating: 4.5,
          reviews: 0,
        });
        toast.success("✓ Product added!", toastCfg);
      }

      closeForm();
      loadProducts();
    } catch (err) {
      console.error("[AdminProducts] Save error:", err);
      toast.error("Save failed: " + (err.message || "Unknown error"), toastCfg);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
      toast.success("Product deleted", toastCfg);
    } catch (err) {
      toast.error("Delete failed: " + err.message, toastCfg);
    }
  };

  // ── Shared input styles ────────────────────────────────────
  const inp = {
    width: "100%", padding: "10px 13px",
    border: "1.5px solid var(--border)", borderRadius: "2px",
    fontFamily: "'Jost', sans-serif", fontSize: "0.86rem",
    background: "var(--cream)", color: "var(--ink)",
    outline: "none", transition: "border-color 0.2s",
  };
  const lbl = {
    display: "block", fontSize: "0.6rem", fontWeight: 500,
    letterSpacing: "2px", textTransform: "uppercase",
    color: "var(--ink-muted)", marginBottom: "0.4rem",
    fontFamily: "'Jost', sans-serif",
  };

  // ── Not connected — show setup guide ──────────────────────
  if (!loading && !backendReady) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 400, marginBottom: "1.5rem" }}>
          Products
        </h1>
        <SetupGuide />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "2rem" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.8rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 400, color: "var(--ink)" }}>
            Products
          </h1>
          <p style={{ fontSize: "0.73rem", color: "var(--ink-faint)", marginTop: "2px", fontFamily: "'Jost', sans-serif" }}>
            {products.length} listings ·{" "}
            <span style={{ color: "var(--green)" }}>🟢 API connected</span>
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--gold)", color: "white", border: "none", padding: "11px 22px", fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", borderRadius: "2px" }}
        >
          <Plus size={15} /> Add Product
        </button>
      </div>

      {/* ── Cloudinary not configured warning ── */}
      {CLOUDINARY_CLOUD_NAME === "YOUR_CLOUD_NAME" && (
        <div style={{ background: "#FEF9C3", border: "1px solid #FDE047", borderRadius: "4px", padding: "12px 16px", marginBottom: "1.5rem", fontSize: "0.8rem", fontFamily: "'Jost', sans-serif", color: "#713F12", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span>⚠️</span>
          <span>
            <strong>Cloudinary not set up yet</strong> — Image upload is disabled. You can still add products using an image URL.{" "}
            <a href="https://cloudinary.com/users/register_free" target="_blank" rel="noreferrer" style={{ color: "var(--gold)", fontWeight: 600 }}>
              Set up Cloudinary free →
            </a>
          </span>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--ink-faint)", fontFamily: "'Jost', sans-serif" }}>
          <Loader size={24} style={{ animation: "spin 1s linear infinite", display: "block", margin: "0 auto 1rem" }} />
          Loading products...
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && products.length === 0 && (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--ink-faint)", fontFamily: "'Jost', sans-serif" }}>
          <p style={{ fontSize: "0.9rem", marginBottom: "1.2rem" }}>No products yet. Add your first one!</p>
          <button onClick={openAdd} style={{ background: "var(--gold)", color: "white", border: "none", padding: "11px 24px", fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer" }}>
            + Add Product
          </button>
        </div>
      )}

      {/* ── Product Grid ── */}
      {!loading && products.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: "14px" }}>
          {products.map((p) => (
            <div key={p.id} style={{ background: "white", border: "1px solid var(--border-soft)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "150px", overflow: "hidden", background: "var(--cream2)" }}>
                <img
                  src={p.imageUrl} alt={p.name} loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { e.target.src = "https://placehold.co/300x150?text=No+Image"; }}
                />
              </div>
              <div style={{ padding: "12px 14px 14px" }}>
                <div style={{ fontSize: "0.58rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: "4px", fontFamily: "'Jost', sans-serif" }}>
                  {p.category}
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", marginBottom: "4px", color: "var(--ink)", lineHeight: 1.3 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--gold)", fontWeight: 500, marginBottom: "10px", fontFamily: "'Jost', sans-serif" }}>
                  ₹{Number(p.price).toLocaleString()}
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-faint)", textDecoration: "line-through", marginLeft: "6px", fontWeight: 400 }}>
                    ₹{Number(p.mrp).toLocaleString()}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => openEdit(p)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", background: "var(--ink)", color: "white", border: "none", padding: "7px 0", fontFamily: "'Jost', sans-serif", fontSize: "0.65rem", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: "1px" }}>
                    <Edit2 size={11} /> Edit
                  </button>
                  <button onClick={() => setDeleteConfirm(p.id)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", background: "#FEE2E2", color: "#C0392B", border: "1px solid #FECACA", padding: "7px 0", fontFamily: "'Jost', sans-serif", fontSize: "0.65rem", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: "1px" }}>
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "white", padding: "2rem", maxWidth: "380px", width: "100%", borderRadius: "4px", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>🗑️</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", marginBottom: "0.5rem" }}>Delete Product?</h3>
            <p style={{ fontSize: "0.83rem", color: "var(--ink-muted)", marginBottom: "1.5rem", fontFamily: "'Jost', sans-serif" }}>
              This cannot be undone. The product will be permanently removed.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "11px", background: "none", border: "1px solid var(--border)", fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: "11px", background: "#C0392B", color: "white", border: "none", fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer" }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showForm && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 300, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "1rem", overflowY: "auto" }}
          onClick={(e) => e.target === e.currentTarget && closeForm()}
        >
          <div style={{ background: "white", width: "100%", maxWidth: "640px", borderRadius: "4px", margin: "auto" }}>

            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.2rem 1.6rem", borderBottom: "1px solid var(--border-soft)" }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 400, color: "var(--ink)" }}>
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={closeForm} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-muted)" }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.6rem", maxHeight: "82vh", overflowY: "auto" }}>

              {/* ── IMAGE SECTION ── */}
              <div style={{ marginBottom: "1.4rem" }}>
                <label style={lbl}>Product Image *</label>

                {/* Tab switcher */}
                <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: "4px", overflow: "hidden", marginBottom: "1rem", width: "fit-content" }}>
                  {["upload", "url"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: "7px 18px",
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "0.7rem", letterSpacing: "1px",
                        textTransform: "uppercase", cursor: "pointer",
                        border: "none",
                        background: activeTab === tab ? "var(--ink)" : "white",
                        color: activeTab === tab ? "white" : "var(--ink-muted)",
                        transition: "all 0.2s",
                      }}
                    >
                      {tab === "upload" ? "📁 Upload File" : "🔗 Image URL"}
                    </button>
                  ))}
                </div>

                {activeTab === "upload" && (
                  <div>
                    {CLOUDINARY_CLOUD_NAME === "YOUR_CLOUD_NAME" ? (
                      /* Cloudinary not configured */
                      <div style={{ background: "#FEF9C3", border: "1px solid #FDE047", borderRadius: "4px", padding: "12px 14px", fontSize: "0.78rem", fontFamily: "'Jost', sans-serif", color: "#713F12" }}>
                        ⚠️ Image upload requires Cloudinary setup. Switch to{" "}
                        <button onClick={() => setActiveTab("url")} style={{ background: "none", border: "none", color: "var(--gold)", fontWeight: 600, cursor: "pointer", fontFamily: "'Jost', sans-serif", fontSize: "0.78rem" }}>
                          Image URL tab
                        </button>{" "}
                        and paste a link from{" "}
                        <a href="https://imgbb.com" target="_blank" rel="noreferrer" style={{ color: "var(--gold)" }}>imgbb.com</a>.
                      </div>
                    ) : (
                      /* Cloudinary configured — show upload UI */
                      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                        {/* Preview box */}
                        <div
                          onClick={() => fileRef.current?.click()}
                          style={{ width: 110, height: 110, borderRadius: "4px", border: "2px dashed var(--border)", overflow: "hidden", flexShrink: 0, background: "var(--cream2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}
                        >
                          {imagePreview ? (
                            <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ textAlign: "center", color: "var(--ink-faint)" }}>
                              <Upload size={22} style={{ margin: "0 auto 4px" }} />
                              <div style={{ fontSize: "0.65rem", fontFamily: "'Jost', sans-serif" }}>Click to pick</div>
                            </div>
                          )}
                        </div>

                        <div style={{ flex: 1 }}>
                          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImagePick} />
                          <button
                            onClick={() => fileRef.current?.click()}
                            style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--cream2)", border: "1px solid var(--border)", padding: "9px 16px", fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", color: "var(--ink-muted)", marginBottom: "8px", borderRadius: "2px" }}
                          >
                            <Upload size={13} /> Choose Image
                          </button>

                          {imageFile && (
                            <div style={{ fontSize: "0.75rem", color: "var(--ink-muted)", marginBottom: "8px", fontFamily: "'Jost', sans-serif" }}>
                              📎 {imageFile.name}
                            </div>
                          )}

                          {/* Upload to Cloudinary button */}
                          {imageFile && !form.imageUrl && (
                            <button
                              onClick={handleUploadNow}
                              disabled={uploadingImage}
                              style={{ display: "flex", alignItems: "center", gap: "6px", background: uploadingImage ? "var(--ink-faint)" : "var(--gold)", color: "white", border: "none", padding: "9px 16px", fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", letterSpacing: "1px", textTransform: "uppercase", cursor: uploadingImage ? "not-allowed" : "pointer", borderRadius: "2px" }}
                            >
                              {uploadingImage
                                ? <><Loader size={12} style={{ animation: "spin 1s linear infinite" }} /> Uploading...</>
                                : <><Upload size={12} /> Upload to Cloudinary</>
                              }
                            </button>
                          )}

                          {form.imageUrl && (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#D1FAE5", border: "1px solid #6EE7B7", borderRadius: "4px", padding: "7px 12px", fontSize: "0.75rem", fontFamily: "'Jost', sans-serif", color: "#065F46" }}>
                              ✓ Image uploaded successfully
                            </div>
                          )}

                          <p style={{ fontSize: "0.68rem", color: "var(--ink-faint)", fontFamily: "'Jost', sans-serif", marginTop: "8px" }}>
                            JPG, PNG, WEBP · Max 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "url" && (
                  <div>
                    <input
                      type="url"
                      placeholder="https://i.ibb.co/your-image.jpg"
                      value={form.imageUrl}
                      onChange={(e) => {
                        set("imageUrl", e.target.value);
                        setImagePreview(e.target.value);
                        setImageFile(null);
                      }}
                      style={inp}
                    />
                    {/* Preview */}
                    {imagePreview && (
                      <div style={{ marginTop: "8px", width: "100%", height: "120px", borderRadius: "4px", overflow: "hidden", background: "var(--cream2)" }}>
                        <img
                          src={imagePreview} alt="Preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      </div>
                    )}
                    <div style={{ marginTop: "10px", background: "var(--cream2)", border: "1px solid var(--border)", borderRadius: "4px", padding: "10px 14px", fontSize: "0.75rem", fontFamily: "'Jost', sans-serif", color: "var(--ink-muted)", lineHeight: 1.7 }}>
                      💡 <strong>Free image hosting options:</strong><br />
                      <a href="https://imgbb.com" target="_blank" rel="noreferrer" style={{ color: "var(--gold)" }}>imgbb.com</a> — Upload → Copy "Direct Link"<br />
                      <a href="https://postimages.org" target="_blank" rel="noreferrer" style={{ color: "var(--gold)" }}>postimages.org</a> — Upload → Copy "Direct link"
                    </div>
                  </div>
                )}
              </div>

              {/* ── PRODUCT NAME ── */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={lbl}>Product Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Ferrari SF90 Stradale"
                  style={inp}
                />
              </div>

              {/* ── CATEGORY + BADGE ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "1rem" }}>
                <div>
                  <label style={lbl}>Category *</label>
                  <select value={form.category} onChange={(e) => set("category", e.target.value)} style={inp}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Badge</label>
                  <select value={form.badge} onChange={(e) => set("badge", e.target.value)} style={inp}>
                    <option value="">None</option>
                    <option value="new">New</option>
                    <option value="bestseller">Bestseller</option>
                  </select>
                </div>
              </div>

              {/* ── PRICE + MRP ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "1rem" }}>
                <div>
                  <label style={lbl}>Selling Price (₹) *</label>
                  <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="599" style={inp} min="0" />
                </div>
                <div>
                  <label style={lbl}>MRP / Original Price (₹) *</label>
                  <input type="number" value={form.mrp} onChange={(e) => set("mrp", e.target.value)} placeholder="899" style={inp} min="0" />
                </div>
              </div>

              {/* ── DESCRIPTION ── */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={lbl}>Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Write a detailed product description..."
                  rows={3}
                  style={{ ...inp, resize: "vertical", minHeight: "80px" }}
                />
              </div>

              {/* ── MORE IMAGES ── */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={lbl}>Additional Images (max 5)</label>
                <div style={{ display: "grid", gap: "8px" }}>
                  <input ref={addFilesRef} type="file" accept="image/*" multiple onChange={handleAdditionalFilesPick} disabled={uploadingAdditional} />
                  <textarea
                    value={form.images}
                    onChange={(e) => set("images", e.target.value)}
                    placeholder={"Or paste image URLs separated by commas or new lines"}
                    rows={2}
                    style={{ ...inp, resize: "vertical", minHeight: "68px" }}
                  />

                  {/* Uploaded URLs only - no duplicates */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {additionalUploadedUrls.map((u, idx) => (
                      <div key={u + idx} style={{ width: 70, height: 70, position: "relative", borderRadius: 6, overflow: "hidden", border: "1px solid var(--border)", background: "var(--cream2)" }}>
                        <img src={u} alt={`uploaded-${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e)=>{e.target.style.display='none'}} />
                        <button onClick={() => removeAdditionalAt(idx)} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.5)", border: "none", color: "white", borderRadius: "999px", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "12px" }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: "0.68rem", color: "var(--ink-faint)", marginTop: "6px", fontFamily: "'Jost', sans-serif" }}>
                  {additionalUploadedUrls.length}/5 additional images uploaded. The first main image + these appear in the product gallery.
                </p>
              </div>

              {/* ── RELATED PRODUCTS ── */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={lbl}>Related Products</label>
                <input
                  placeholder="Search products by name..."
                  value={relatedQuery}
                  onChange={(e) => setRelatedQuery(e.target.value)}
                  style={inp}
                />
                {/* Suggestions */}
                {relatedQuery && (
                  <div style={{ border: "1px solid var(--border)", borderRadius: "4px", marginTop: "8px", maxHeight: "160px", overflowY: "auto", background: "white" }}>
                    {products.filter((pp) => pp.name.toLowerCase().includes(relatedQuery.toLowerCase()) && pp.id !== editingId && !selectedRelated.find((s) => String(s.id) === String(pp.id))).slice(0,8).map((s) => (
                      <div key={s.id} style={{ padding: "8px 10px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => { setSelectedRelated((prev) => [...prev, s]); setRelatedQuery(""); }}>
                        <img src={s.imageUrl} alt={s.name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} onError={(e)=>{e.target.style.display='none'}} />
                        <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.9rem", color: "var(--ink)" }}>{s.name}</div>
                      </div>
                    ))}
                    {products.filter((pp) => pp.name.toLowerCase().includes(relatedQuery.toLowerCase()) && pp.id !== editingId && !selectedRelated.find((s) => String(s.id) === String(pp.id))).length === 0 && (
                      <div style={{ padding: "8px 10px", color: "var(--ink-faint)", fontFamily: "'Jost', sans-serif" }}>No matches</div>
                    )}
                  </div>
                )}

                {/* Selected chips */}
                {selectedRelated.length > 0 && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                    {selectedRelated.map((r) => (
                      <div key={r.id} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 10px", borderRadius: "999px", background: "var(--cream2)", border: "1px solid var(--border)", fontFamily: "'Jost', sans-serif" }}>
                        <img src={r.imageUrl} alt={r.name} style={{ width: 28, height: 28, objectFit: "cover", borderRadius: 4 }} onError={(e)=>{e.target.style.display='none'}} />
                        <div style={{ fontSize: "0.86rem", color: "var(--ink)" }}>{r.name}</div>
                        <button onClick={() => setSelectedRelated((prev) => prev.filter((x) => String(x.id) !== String(r.id)))} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--ink-muted)" }}><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
                <p style={{ fontSize: "0.68rem", color: "var(--ink-faint)", marginTop: "6px", fontFamily: "'Jost', sans-serif" }}>
                  Add related products to appear on the product details page. Order matters — first item shows first.
                </p>
              </div>

              {/* ── FEATURES ── */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={lbl}>Features (comma separated)</label>
                <input
                  value={form.features}
                  onChange={(e) => set("features", e.target.value)}
                  placeholder="1:18 Scale, Opening Doors, Die-Cast Metal, Display Box"
                  style={inp}
                />
                <p style={{ fontSize: "0.68rem", color: "var(--ink-faint)", marginTop: "4px", fontFamily: "'Jost', sans-serif" }}>
                  Separate each feature with a comma
                </p>
              </div>

              {/* ── IN STOCK ── */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.6rem" }}>
                <input
                  type="checkbox" id="inStock"
                  checked={form.inStock}
                  onChange={(e) => set("inStock", e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "var(--gold)", cursor: "pointer" }}
                />
                <label htmlFor="inStock" style={{ ...lbl, margin: 0, cursor: "pointer" }}>
                  In Stock (visible to customers)
                </label>
              </div>

              {/* ── ACTION BUTTONS ── */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={closeForm}
                  style={{ flex: 1, padding: "12px", background: "none", border: "1px solid var(--border)", fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", color: "var(--ink-muted)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || uploadingImage || uploadingAdditional}
                  style={{ flex: 2, padding: "12px", background: (saving || uploadingImage || uploadingAdditional) ? "var(--ink-faint)" : "var(--ink)", color: "white", border: "none", fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", cursor: (saving || uploadingImage || uploadingAdditional) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  {saving
                    ? <><Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> Saving...</>
                    : uploadingImage
                    ? <><Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> Uploading image...</>
                    : uploadingAdditional
                    ? <><Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> Uploading additional...</>
                    : editingId ? "✓ Save Changes" : "✓ Add Product"
                  }
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, select:focus, textarea:focus {
          border-color: var(--gold) !important;
          background: white !important;
        }
      `}</style>
    </div>
  );
}

// ── Setup Guide (shown when backend not connected) ──────────────
function SetupGuide() {
  return (
    <div>
      <div style={{ background: "#FEF9C3", border: "1px solid #FDE047", borderRadius: "4px", padding: "1.2rem 1.4rem", marginBottom: "1.5rem", fontFamily: "'Jost', sans-serif", fontSize: "0.83rem", color: "#713F12" }}>
        ⚠️ <strong>Backend not connected.</strong> Follow the steps below to connect.
      </div>

      <div style={{ background: "white", border: "1px solid var(--border-soft)", borderRadius: "4px", padding: "2rem", maxWidth: "680px" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
          Step 1 — Run in VS Code Terminal
        </h2>
        <pre style={{ background: "#1a1a2e", color: "#6EE7B7", padding: "1rem", borderRadius: "4px", marginBottom: "1.5rem", fontSize: "0.85rem" }}>
          cd server
npm install
npm run dev
        </pre>

        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
          Step 2 — Create MongoDB Database
        </h2>
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--ink-muted)", lineHeight: 1.75, marginBottom: "1.5rem" }}>
          Create a MongoDB Atlas cluster or use a local MongoDB instance, then copy the connection string into <strong>server/.env</strong> as <strong>MONGO_URI</strong>.
        </p>

        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
          Step 3 — Start the API
        </h2>
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--ink-muted)", lineHeight: 1.75, marginBottom: "1.5rem" }}>
          The API runs on <strong>http://localhost:5000</strong> by default. Keep the frontend pointed at <strong>REACT_APP_API_URL</strong> in the root .env file.
        </p>

        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
          Step 4 — Create .env file
        </h2>
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--ink-muted)", marginBottom: "0.5rem" }}>
          In VS Code root folder (same level as package.json) → add <strong>REACT_APP_API_URL</strong> and your Cloudinary values in <strong>.env</strong>.
        </p>
        <pre style={{ background: "#1a1a2e", color: "#6EE7B7", padding: "1rem", borderRadius: "4px", marginBottom: "1.5rem", fontSize: "0.75rem", lineHeight: 1.8 }}>
{`REACT_APP_API_URL=http://localhost:5000
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset`}
        </pre>

        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
          Step 5 — Restart
        </h2>
        <pre style={{ background: "#1a1a2e", color: "#6EE7B7", padding: "1rem", borderRadius: "4px", marginBottom: "0", fontSize: "0.85rem" }}>
          {`Ctrl + C    (stop the app)\nnpm start   (restart frontend)`}
        </pre>
      </div>
    </div>
  );
}