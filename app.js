import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp, query, orderBy, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAhZ3IonHiEBZD2Zc_vuiRgVmChDT-34BI",
    authDomain: "charizard-1061d.firebaseapp.com",
    projectId: "charizard-1061d",
    storageBucket: "charizard-1061d.firebasestorage.app",
    messagingSenderId: "1029262794736",
    appId: "1:1029262794736:web:32792437ecc029773d8735"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- GLOBAL YÖNETİM FONKSİYONLARI (HTML içinden çağrılabilmesi için window objesine ekliyoruz) ---

window.ihbarIncelendi = async (id) => {
    if(confirm("Bu ihbarı incelendi olarak işaretleyip listeden silmek istiyor musunuz?")) {
        await deleteDoc(doc(db, "ihbarlar", id));
        alert("İhbar incelendi ve silindi.");
        adminListeleriniGetir(); // Listeyi yenile
    }
};

window.icerikSil = async (koleksiyon, id) => {
    if(confirm("Bu içeriği kalıcı olarak silmek istediğinize emin misiniz?")) {
        await deleteDoc(doc(db, koleksiyon, id));
        adminListeleriniGetir(); // Listeyi yenile
    }
};

window.icerikDuzenle = async (koleksiyon, id, eskiBaslik, eskiMetin) => {
    const yeniBaslik = prompt("Yeni Başlık:", eskiBaslik);
    if(yeniBaslik === null) return; // İptal edildi
    
    const yeniMetin = prompt("Yeni Metin:", eskiMetin);
    if(yeniMetin === null) return; // İptal edildi

    await updateDoc(doc(db, koleksiyon, id), {
        baslik: yeniBaslik,
        metin: yeniMetin
    });
    alert("İçerik başarıyla güncellendi.");
    adminListeleriniGetir(); // Listeyi yenile
};

// --- ADMİN PANELİ LİSTELERİNİ ÇEKME FONKSİYONU ---
async function adminListeleriniGetir() {
    // 1. İhbarları Çek
    const ihbarDiv = document.getElementById('ihbarListesi');
    if(ihbarDiv) {
        try {
            const q = query(collection(db, "ihbarlar"), orderBy("tarih", "desc"));
            const snap = await getDocs(q);
            let html = "";
            snap.forEach(d => {
                const data = d.data();
                html += `
                <div class="admin-list-item">
                    <strong>${data.adSoyad} (${data.email})</strong><br>
                    <a href="${data.url}" target="_blank">${data.url}</a>
                    <p style="margin: 5px 0;">${data.sikayet}</p>
                    <button class="btn-small btn-success" onclick="window.ihbarIncelendi('${d.id}')">✓ İncelendi (Sil)</button>
                </div>`;
            });
            ihbarDiv.innerHTML = html || "<p>Şu an USOM bekleyen ihbar bulunmuyor.</p>";
        } catch (err) { ihbarDiv.innerHTML = "Hata: " + err.message; }
    }

    // 2. Dokümanları Çek
    const dokumanDiv = document.getElementById('adminDokumanListesi');
    if(dokumanDiv) {
        try {
            const q = query(collection(db, "dokumanlar"), orderBy("tarih", "desc"));
            const snap = await getDocs(q);
            let html = "";
            snap.forEach(d => {
                const data = d.data();
                html += `
                <div class="admin-list-item">
                    <strong>${data.baslik}</strong>
                    <div class="admin-actions">
                        <button class="btn-small btn-edit" onclick="window.icerikDuzenle('dokumanlar', '${d.id}', '${data.baslik}', '${data.metin}')">Düzenle</button>
                        <button class="btn-small btn-delete" onclick="window.icerikSil('dokumanlar', '${d.id}')">Sil</button>
                    </div>
                </div>`;
            });
            dokumanDiv.innerHTML = html || "<p>Kayıtlı doküman yok.</p>";
        } catch (err) { dokumanDiv.innerHTML = "Hata: " + err.message; }
    }

    // 3. Haberleri Çek
    const haberDiv = document.getElementById('adminHaberListesi');
    if(haberDiv) {
        try {
            const q = query(collection(db, "haberler"), orderBy("tarih", "desc"));
            const snap = await getDocs(q);
            let html = "";
            snap.forEach(d => {
                const data = d.data();
                html += `
                <div class="admin-list-item">
                    <strong>${data.baslik}</strong>
                    <div class="admin-actions">
                        <button class="btn-small btn-edit" onclick="window.icerikDuzenle('haberler', '${d.id}', '${data.baslik}', '${data.metin}')">Düzenle</button>
                        <button class="btn-small btn-delete" onclick="window.icerikSil('haberler', '${d.id}')">Sil</button>
                    </div>
                </div>`;
            });
            haberDiv.innerHTML = html || "<p>Kayıtlı haber yok.</p>";
        } catch (err) { haberDiv.innerHTML = "Hata: " + err.message; }
    }
}

// --- GENEL SİTE İŞLEMLERİ (Önceki kodlarınla aynı) ---

const ihbarForm = document.getElementById('ihbarForm');
if(ihbarForm) ihbarForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "ihbarlar"), {
        adSoyad: document.getElementById('iAdSoyad').value,
        email: document.getElementById('iEmail').value,
        url: document.getElementById('iUrl').value,
        sikayet: document.getElementById('iSikayet').value,
        tarih: serverTimestamp()
    });
    alert("İhbarınız alındı.");
    ihbarForm.reset();
});

const gonulluForm = document.getElementById('gonulluForm');
if(gonulluForm) gonulluForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "gonulluler"), {
        adSoyad: document.getElementById('gAdSoyad').value,
        email: document.getElementById('gEmail').value,
        alan: document.getElementById('gAlan').value,
        tarih: serverTimestamp()
    });
    alert("Başvurunuz alındı.");
    gonulluForm.reset();
});

const loginSection = document.getElementById('login-section');
const adminDashboard = document.getElementById('admin-dashboard');

if (loginSection) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loginSection.style.display = 'none';
            adminDashboard.style.display = 'block';
            adminListeleriniGetir(); // Admin paneli açılınca verileri yükle
        } else {
            loginSection.style.display = 'block';
            adminDashboard.style.display = 'none';
        }
    });

    document.getElementById('loginBtn')?.addEventListener('click', () => {
        const email = document.getElementById('adminEmail').value;
        const pass = document.getElementById('adminPassword').value;
        signInWithEmailAndPassword(auth, email, pass).catch(err => alert("Giriş başarısız: " + err.message));
    });

    document.getElementById('logoutBtn')?.addEventListener('click', () => signOut(auth));

    document.getElementById('addDocForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addDoc(collection(db, "dokumanlar"), {
            baslik: document.getElementById('docTitle').value,
            metin: document.getElementById('docText').value,
            kod: document.getElementById('docCode').value,
            video: document.getElementById('docVideo').value,
            tarih: serverTimestamp()
        });
        document.getElementById('addDocForm').reset();
        adminListeleriniGetir();
    });

    document.getElementById('addNewsForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addDoc(collection(db, "haberler"), {
            baslik: document.getElementById('newsTitle').value,
            metin: document.getElementById('newsText').value,
            video: document.getElementById('newsVideo').value,
            tarih: serverTimestamp()
        });
        document.getElementById('addNewsForm').reset();
        adminListeleriniGetir();
    });
}

// Ziyaretçi Sayfaları (Haberler ve Dokümanlar Gösterimi)
const haberlerListesi = document.getElementById('haberler-listesi');
if (haberlerListesi) {
    getDocs(query(collection(db, "haberler"), orderBy("tarih", "desc"))).then(snap => {
        let html = "";
        snap.forEach(d => {
            const data = d.data();
            const vid = data.video ? `<a href="${data.video}" target="_blank" style="color:#0071e3; font-weight:600; text-decoration:none; display:block; margin-top:10px;">Videoyu İzle →</a>` : '';
            html += `<div class="card"><h2 style="font-size:1.2rem; margin-bottom:0.5rem;">${data.baslik}</h2><p style="font-size:0.9rem;">${data.metin}</p>${vid}</div>`;
        });
        haberlerListesi.innerHTML = html || "<div class='card'><p>Haber yok.</p></div>";
    });
}

const dokumanlarListesi = document.getElementById('dokumanlar-listesi');
if (dokumanlarListesi) {
    getDocs(query(collection(db, "dokumanlar"), orderBy("tarih", "desc"))).then(snap => {
        let html = "";
        snap.forEach(d => {
            const data = d.data();
            const kod = data.kod ? `<pre style="font-size:0.8rem; margin-top:10px;"><code>${data.kod}</code></pre>` : '';
            const vid = data.video ? `<a href="${data.video}" target="_blank" style="color:#0071e3; font-weight:600; text-decoration:none; display:block; margin-top:10px;">Videolu Anlatım →</a>` : '';
            html += `<div class="card"><h2 style="font-size:1.2rem; margin-bottom:0.5rem;">${data.baslik}</h2><p style="font-size:0.9rem;">${data.metin}</p>${kod}${vid}</div>`;
        });
        dokumanlarListesi.innerHTML = html || "<p style='text-align:center;'>Doküman yok.</p>";
    });
}S