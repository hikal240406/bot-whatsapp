const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

// Data Owner
const owner1 = '6281268286077@c.us'; // Farel
const owner2 = '6282171084921@c.us'; // Dimas

// Data Order
const ordersFile = 'orders.json';
let pendingOrders = fs.existsSync(ordersFile) ? JSON.parse(fs.readFileSync(ordersFile, 'utf8')) : {};

// Fungsi menyimpan data order ke file
const saveOrders = () => fs.writeFileSync(ordersFile, JSON.stringify(pendingOrders, null, 2));

// Fungsi mencari order berdasarkan kode
const findOrder = (orderCode) => Object.values(pendingOrders).find(o => o.orderCode.trim().toLowerCase() === orderCode.trim().toLowerCase());

// Fungsi mengirim pesan dengan aman
const sendMessageSafe = async (to, message, media = null) => {
    if (!to.includes('@c.us')) return;
    try {
        media ? await client.sendMessage(to, media) : await client.sendMessage(to, message);
    } catch (error) {
        console.error(`❌ Gagal mengirim ke ${to}: ${error.message}`);
    }
};

// QR Code untuk login
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('🔹 Scan QR untuk login ke WhatsApp');
});

client.on('ready', () => console.log('✅ Bot siap digunakan!'));

client.on('message', async message => {
    const text = message.body.toLowerCase();
    const sender = message.from;
    
    if (!sender.includes('@c.us')) return;

    if (text === 'halo' || text === 'hi') {
        sendMessageSafe(sender, `✨ *Kenapa Pilih Kami?* ✨\n\n🚀 *Kecepatan Pengerjaan*\n🎯 *Gratis 2 Cetakan untuk ACC*\n🖨 *Jasa Pencetakan*\n🛠 *Layanan Personalisasi*\n📄 *Format Word & PDF*`);
        return;
    }

    if (text === 'order') {
        sendMessageSafe(sender, `★ *Paket Pemesanan*\n\n• *1* Ketikan B. Arab - Rp. 80.000\n• *2* Ketikan Terjemah - Rp. 50.000\n• *3* B. Arab + Terjemah Dicari Sendiri - Rp. 100.000\n• *4* B. Arab + Terjemah Langsung Jadi - Rp. 200.000\n• *5* Pembuatan Cover - Rp. 20.000\n\nKetik *pilih [nomor paket]* untuk melanjutkan.`);
        return;
    }

    if (text.startsWith('pilih ')) {
        const paket = text.split(' ')[1];
        const hargaPaket = { '1': 80000, '2': 50000, '3': 100000, '4': 200000, '5': 20000 };
        
        if (!hargaPaket[paket]) {
            sendMessageSafe(sender, '⚠ Paket tidak ditemukan! Pilih angka dari 1-5.');
            return;
        }
        
        const orderCode = 'ORD' + Math.floor(1000 + Math.random() * 9000);
        pendingOrders[sender] = { orderCode, sender, completed: false, status: 'Belum dikerjakan', paket, harga: hargaPaket[paket] };
        saveOrders();
        
        sendMessageSafe(sender, `📋 Kirim data: *Nama | Tanda Resume | Guru Pembimbing | Wali Kelas | Kelas*`);
        return;
    }

    if (pendingOrders[sender] && !pendingOrders[sender].completed) {
        const data = text.split('|').map(item => item.trim());
        if (data.length < 5) {
            sendMessageSafe(sender, '⚠ Format salah! Gunakan: Nama | Tanda Resume | Guru Pembimbing | Wali Kelas | Kelas');
            return;
        }
    pendingOrders[sender] = { 
        ...pendingOrders[sender], 
        name: data[0], 
        tandaResume: data[1], 
        guru: data[2], 
        wali: data[3], 
        kelas: data[4], 
        phoneNumber: sender, // Menyimpan nomor pengirim pesan
        completed: true };
        saveOrders();
        sendMessageSafe(sender, `✅ Data diterima! Kode Order: ${pendingOrders[sender].orderCode}\n💰 Total Bayar: Rp. ${pendingOrders[sender].harga}\n\nTransfer ke *Dana: 081268286077* lalu kirim bukti pembayaran.`);
        return;
    }

    if (message.hasMedia) {
        if (!pendingOrders[sender] || !pendingOrders[sender].completed) {
            sendMessageSafe(sender, '⚠ Anda belum memiliki order! Ketik *ORDER* untuk memesan.');
            return;
        }
        pendingOrders[sender].status = 'Menunggu konfirmasi';
        saveOrders();
        const media = await message.downloadMedia();
        sendMessageSafe(owner1, `📩 *Konfirmasi Pembayaran Baru!* \n👤 *Nama:* ${pendingOrders[sender].name} \n📌 *Kode Order:* ${pendingOrders[sender].orderCode}`, media);
        sendMessageSafe(sender, '📩 Bukti pembayaran dikirim ke admin. Tunggu konfirmasi.');
        return;
    }
    // Owner 1 mengonfirmasi pembayaran
    if (text.startsWith('konfirmasi bayar') && sender === owner1) {
        const order = Object.values(pendingOrders).find(o => o.status === 'Menunggu konfirmasi');

        if (!order) {
            sendMessageSafe(sender, '⚠ Tidak ada order menunggu konfirmasi.');
            return;
        }

        order.status = 'Belum dikerjakan';
        saveOrders();
        
        sendMessageSafe(owner1, `✅ Pembayaran untuk Order ${order.orderCode} telah dikonfirmasi.`);
        sendMessageSafe(owner2, `📌 *Pesanan Baru!* \n📌 *Kode Order:* ${order.orderCode} \n👤 *Nama:* ${order.name} \nOwner bisa balas dengan *Ambil Order ${order.orderCode}* untuk mengerjakan.`);
        sendMessageSafe(order.sender, `✅ Pembayaran dikonfirmasi! Order Anda ${order.orderCode} sedang menunggu pengerjaan.`);
        return;
    }

    // Owner mengambil order
    if (text.startsWith('ambil order')) {
        const orderCode = text.split(' ')[2];
        const order = findOrder(orderCode);

        if (!order) {
            sendMessageSafe(sender, `⚠ Order dengan kode ${orderCode} tidak ditemukan.`);
            return;
        }

        if (order.assigned) {
            sendMessageSafe(sender, `⚠ Order ${orderCode} sudah diambil oleh ${order.assigned === owner1 ? 'Owner 1' : 'Owner 2'}.`);
            return;
        }

        order.assigned = sender;
        order.status = 'Dikerjakan';
        saveOrders();

        sendMessageSafe(owner1, `✅ Order ${orderCode} telah diambil oleh ${sender === owner1 ? 'Owner 1' : 'Owner 2'}.`);
        sendMessageSafe(owner2, `✅ Order ${orderCode} telah diambil oleh ${sender === owner1 ? 'Owner 1' : 'Owner 2'}.`);
        sendMessageSafe(order.sender, `✅ Order Anda ${orderCode} sedang dikerjakan. owner akan segera menghubungi untuk detail tugas`);
        return;
    }

    // Owner menyelesaikan order
    if (text.startsWith('selesai order')) {
        const orderCode = text.split(' ')[2];
        const order = findOrder(orderCode);

        if (!order) {
            sendMessageSafe(sender, `⚠ Order dengan kode ${orderCode} tidak ditemukan.`);
            return;
        }

        delete pendingOrders[order.sender]; // Hapus order setelah selesai
        saveOrders();

        sendMessageSafe(owner1, `✅ Order ${orderCode} telah selesai.`);
        sendMessageSafe(owner2, `✅ Order ${orderCode} telah selesai.`);
        sendMessageSafe(order.sender, `✅ Order Anda ${orderCode} telah selesai, silahkan tunggu pengiriman file dari owner. Terima kasih!`);
        return;
    }


    // Owner melihat semua order + detail lengkap
    if (text === 'info all' && (sender === owner1 || sender === owner2)) {
        let orderList = '📋 *Semua Order Aktif:*\n';

        Object.values(pendingOrders).forEach(order => {
            orderList += `\n📌 *Kode Order:* ${order.orderCode}
👤 *Nama:* ${order.name}
📞 *Nomor Telepon:* ${order.phoneNumber} 
📝 *Tanda Resume:* ${order.tandaResume}
👨‍🏫 *Guru Pembimbing:* ${order.guru}
👨‍👩‍👧‍👦 *Wali Kelas:* ${order.wali}
🚀 *Kelas:* ${order.kelas}
📌 *Paket:* ${order.paket}
📌 *Status:* ${order.status === 'Dikerjakan' ? '🛠 Dikerjakan' : '⏳ Belum dikerjakan'}
👷 *Dikerjakan oleh:* ${order.assigned ? (order.assigned === owner1 ? 'Owner 1' : 'Owner 2') : 'Belum diambil'}\n`;
    });

        sendMessageSafe(sender, orderList === '📋 *Semua Order Aktif:*\n' ? '⚠ Tidak ada order aktif.' : orderList);
        return;
    }
});

client.initialize();