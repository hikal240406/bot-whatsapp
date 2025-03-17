/*
 📙Main Js Dari: Index MchaX
 👨‍💻Remake: Deku
*/

(async () => {
  const {
    default: makeWASocket,
    useMultiFileAuthState,
    jidNormalizedUser,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers,
    proto,
    makeInMemoryStore,
    DisconnectReason,
    delay,
    generateWAMessage,
    getAggregateVotesInPollMessage,
    areJidsSameUser,
  } = require("baileys");
  const pino = require("pino");
  const { Boom } = require("@hapi/boom");
  const chalk = require("chalk");
  const readline = require("node:readline");
  const simple = require("./lib/simple.js");
  const fs = require("node:fs");
  const fetch = require("node-fetch");
  const path = require("path");
  const axios = require("axios");
  const pkg = require("./package.json");
  const NodeCache = require("node-cache");
  const moment = require("moment-timezone");
  const canvafy = require("canvafy");
  const Func = require("./lib/function.js");
  const Uploader = require("./lib/uploader.js");
  const Queque = require("./lib/queque.js");
  const messageQueue = new Queque();
  const Database = require("./lib/database.js");
  const append = require("./lib/append");
  const serialize = require("./lib/serialize.js");
  const config = require("./settings.js");

  const appenTextMessage = async (m, sock, text, chatUpdate) => {
    let messages = await generateWAMessage(
      m.key.remoteJid,
      {
        text: text,
      },
      {
        quoted: m.quoted,
      },
    );
    messages.key.fromMe = areJidsSameUser(m.sender, sock.user.id);
    messages.key.id = m.key.id;
    messages.pushName = m.pushName;
    if (m.isGroup) messages.participant = m.sender;
    let msg = {
      ...chatUpdate,
      messages: [proto.WebMessageInfo.fromObject(messages)],
      type: "append",
    };
    return sock.ev.emit("messages.upsert", msg);
  };

  const question = (text) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    return new Promise((resolve) => {
      rl.question(text, resolve);
    });
  };
  global.db = new Database(config.database + ".json");
  await db.init();

  global.pg = new (await require(process.cwd() + "/lib/plugins"))(
    process.cwd() + "/system/plugins",
  );
  await pg.watch();

  global.scraper = new (await require(process.cwd() + "/scrapers"))(
    process.cwd() + "/scrapers/src",
  );
  await scraper.watch();

  setInterval(async () => {
    await db.save();
    await pg.load();
    await scraper.load();
  }, 2000);

  global.axios = axios;
  global.fs = fs;
  global.cheerio = require("cheerio");
  global.block_message = new Set();
  global.lastCall = new Map();
  global.groupCache = new NodeCache({stdTTL: 5 * 60, useClones: false});
  global.pickRandom = function pickRandom(list) {
     return list[Math.floor(Math.random() * list.length)];
  };
  
  const store = makeInMemoryStore({
    logger: pino().child({
      level: "silent",
      stream: "store",
    }),
  });
  const logger = pino({
    timestamp: () => `,"time":"${new Date().toJSON()}"`,
  }).child({ class: "Jamalll-24" });
  logger.level = "fatal";
  
    console.log(chalk.blue.bold(`⣿⣿⡿⠉⢋ ⢀⡏⡀⠠⠐  ⠂⢸⢸⣿⡀  ⢰⡀ ⠂ ⠂⠈ ⢈   ⠆⡄ 
⢠⠠⠆⠈⡄ ⣾⠇⡇⠆⡓⠁  ⣿⢸⣿⣷⡀  ⣿⣆⠐⠂⠈ ⢁  ⡀ ⢰⣷⡤
⡇⠈⢇⠁⠁⢰⣿ ⡇⢀⠠⠈⠒⢤⣿⠸⣿⣿⣿⣄ ⠸⣿⣆⢯ ⠄⠐  ⢰⢸⢸⣿⣿
⡇⡆⠟ ⡆⣼⡿ ⣷⠸⡆⠆ ⢸⣿⡆⡏⠻⢿⣿⣦⡘⠬⣿⡼⣇⢀⣆⣤ ⢸⣸⡼⢿⣿
⡇⡇ ⣧⣇⣿⡇⣸⣿⡆⣿⡄⡀⠘⣿⣧⢠⣴⣾⣿⣿⠟⠓⢫⠿⢹⣼⣿⡖ ⢸⣿⣶⣆⣿
⡇⡇ ⣿⣿⣿⣧⣿⣿⣯⡜⣿⣄⡀⢿⡿⣿⠋⠁⣿⣿⣷ ⠘  ⠇⣿⣿ ⣿⣿⡆⣼⣿
⣧⣷ ⣿⣟⠙⠉⣿⣿⡍⠛⢿⡘⢿⣜⣧   ⠋ ⠁     ⠘⢹⣷⣿⡟⣴⣿⣿
⣿⣿⡄⣿⣿⠂ ⠛⠙⠃  ⡇ ⠉⠻            ⢸⣏⣤⣾⣿⣿⣿
⣿⣿⣷⣸⣿      ⠰                ⢠⡏⠉⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣄     ⢠⡀               ⡼  ⣿⢿⣟⠛
⣻⣿⣿⣿⣿⣿⡄    ⠈⠓              ⣰⠃  ⢿⣶⣷⣾
⣿⣿⣯⣿⣿⣿⣿⣆     ⢀⡠⠄⠒⠒ ⠐     ⢀⣼⡏   ⢸⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣷⣤⡀   ⠐⠒⠛⠉⠁    ⣠⣴⣿⣿⠁   ⢸⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⡀      ⢀⣠⣾⣿⢿⣿⠇    ⣸⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣤⣤⣤⣴⣶⣿⣿⠟⠁⣼⡏ ⢀⣠⣶⣿⣿⣿⣿⣿
⣿⣿⡟⣿⣿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠃ ⢰⡿⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟  ⢀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏ ⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
Welcome to Script HanakoBotz / Dxyz - Lxzy`))
    console.log(chalk.blue.bold(`By: Mr. F`))

    console.log(chalk.yellow.bold("📁 Inisialisasi modul..."));
    console.log(chalk.cyan.bold("- API Baileys Telah Dimuat"));
    console.log(chalk.cyan.bold("- Sistem File Siap Digunakan"));
    console.log(chalk.cyan.bold("- Database Telah Diinisialisasi"));

    console.log(chalk.blue.bold("\n🤖 Info Bot:"));
    console.log(chalk.white.bold("  | GitHub: ") + chalk.cyan.bold("https://github.com/LeooxzyDekuu"));
    console.log(chalk.white.bold("  | Developer: ") + chalk.green.bold("Leooxzy/Deku"));
    console.log(chalk.white.bold("  | Base Script: ") + chalk.green.bold("AxellNetwork"));
    console.log(chalk.white.bold("  | Status Server: ") + chalk.green.bold("Online"));
    console.log(chalk.white.bold("  | Versi: ") + chalk.magenta.bold(pkg.version));
    console.log(chalk.white.bold("  | Versi Node.js: ") + chalk.magenta.bold(process.version));

    console.log(chalk.blue.bold("\n🔁 Memuat plugin dan scraper dan case..."))

  async function system() {
    const { state, saveCreds } = await useMultiFileAuthState(config.sessions);
    const sock = simple(
      {
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        cachedGroupMetadata: async (jid) => groupCache.get(jid),
        version: [2, 3000, 1019441105],
        browser: Browsers.ubuntu("Edge"),
        getMessage: async (key) => {
          const jid = jidNormalizedUser(key.remoteJid);
          const msg = await store.loadMessage(jid, key.id);
          return msg?.message || "";
        },
        shouldSyncHistoryMessage: (msg) => {
          console.log(`\x1b[32mMemuat chat [${msg.progress}%]\x1b[39m`);
          return !!msg.syncType;
        },
      },
      store,
    );
    global.hanako = sock;
    store.bind(sock.ev);
    if (!sock.authState.creds.registered) {
      console.log(
        chalk.white.bold(
          "- Silakan masukkan nomor WhatsApp Anda, misalnya 628xxxx",
        ),
      );
      const phoneNumber = await question(chalk.green.bold(`– Nomor Anda: `));
      const code = await sock.requestPairingCode(phoneNumber, "FARELGAN");
      setTimeout(() => {
        console.log(chalk.white.bold("- Kode Pairing Anda: " + code));
      }, 3000);
    }

    //=====[ Pembaruan Koneksi ]======
        sock.ev.on("connection.update", async (update) => {
            const {
                connection,
                lastDisconnect
            } = update;
            if (connection === "close") {
                const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                if (lastDisconnect.error == "Error: Stream Errored (unknown)") {
                    process.exit(0)
                } else if (reason === DisconnectReason.badSession) {
                    console.log(
                        chalk.red.bold("File sesi buruk, Harap hapus sesi dan scan ulang"),
                    );
                    process.exit(0)
                } else if (reason === DisconnectReason.connectionClosed) {
                    console.log(
                        chalk.yellow.bold("Koneksi ditutup, sedang mencoba untuk terhubung kembali..."),
                    );
                    process.exit(0)
                } else if (reason === DisconnectReason.connectionLost) {
                    console.log(
                        chalk.yellow.bold("Koneksi hilang, mencoba untuk terhubung kembali..."),
                    );
                    process.exit(0)
                } else if (reason === DisconnectReason.connectionReplaced) {

                    console.log(
                        chalk.green.bold("Koneksi diganti, sesi lain telah dibuka. Harap tutup sesi yang sedang berjalan."),
                    );
                    sock.logout();
                } else if (reason === DisconnectReason.loggedOut) {
                    console.log(
                        chalk.green.bold("Perangkat logout, harap scan ulang."),
                    );
                    sock.logout();
                } else if (reason === DisconnectReason.restartRequired) {
                    console.log(chalk.green.bold("Restart diperlukan, sedang memulai ulang..."));
                    system();
                } else if (reason === DisconnectReason.timedOut) {
                    console.log(
                        chalk.green.bold("Koneksi waktu habis, sedang mencoba untuk terhubung kembali..."),
                    );
                    process.exit(0)
                }
            } else if (connection === "connecting") {
                console.log(chalk.blue.bold("Menghubungkan ke WhatsApp..."));
            } else if (connection === "open") {
                console.log(chalk.green.bold("Bot berhasil terhubung."));
            }
        });

    //=====[ Setelah Pembaruan Koneksi ]========//
    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("contacts.update", (update) => {
      for (let contact of update) {
        let id = jidNormalizedUser(contact.id);
        if (store && store.contacts)
          store.contacts[id] = {
            ...(store.contacts?.[id] || {}),
            ...(contact || {}),
          };
      }
    });

    sock.ev.on("contacts.upsert", (update) => {
      for (let contact of update) {
        let id = jidNormalizedUser(contact.id);
        if (store && store.contacts)
          store.contacts[id] = { ...(contact || {}), isContact: true };
      }
    });

    sock.ev.on("groups.update", async (updates) => {
      for (const update of updates) {
        const id = update.id;
        const metadata = await sock.groupMetadata[id];
        groupCache.set(id, metadata);
        if (store.groupMetadata[id]) {
          store.groupMetadata[id] = {
            ...(store.groupMetadata[id] || {}),
            ...(update || {}),
          };
        }
      }
    });

        sock.ev.on("group-participants.update", async (groupUpdate) => {
            try {
                let {
                    id,
                    participants,
                    action
                } = groupUpdate;
                let groupMetadata = await sock.groupMetadata(id);
                let totalMembers = groupMetadata.participants.length;
                const metadata = await sock.groupMetadata[id];

                for (let participant of participants) {
                    if (action === "add") {
                        sock.sendMessage(id, {
                            image: {
                                url: "https://files.catbox.moe/mk2oik.jpg"
                            },
                            caption: `Yokoso! (Selamat datang!) Untuk member baru! bernama @${participant.split("@")[0]} ${config.name}-Kun senang sekali bisa bertemu denganmu! *🤩*\nJan Lupa Baca Rules Ya Membaru`,
                            footer: config.name,
                            buttons: [{
                                buttonId: ".menu",
                                buttonText: {
                                    displayText: 'Welcome'
                                }
                            }],
                            viewOnce: true,
                            headerType: 6,
                            contextInfo: {
                                mentionedJid: [participant],
                                isForwarded: !0,
                                forwardingScore: 127,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: config.saluran,
                                    newsletterName: Func.Styles(`${config.name} By Creator: ${config.ownername}`),
                                    serverMessageId: -1
                                },
                            }
                        });
                    } else if (action === "remove") {
                        sock.sendMessage(id, {
                            image: {
                                url: "https://files.catbox.moe/mk2oik.jpg"
                            },
                            caption: `Sayonara, @${participant.split("@")[0]}-kun! Mata ne! :)`,
                            footer: config.name,
                            buttons: [{
                                buttonId: ".menu",
                                buttonText: {
                                    displayText: 'Goodbye'
                                }
                            }],
                            viewOnce: true,
                            headerType: 6,
                            contextInfo: {
                                mentionedJid: [participant],
                                isForwarded: !0,
                                forwardingScore: 127,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: config.saluran,
                                    newsletterName: Func.Styles(`${config.name} By Creator: ${config.ownername}`),
                                    serverMessageId: -1
                                },
                            }
                        });
                    }
                }
              groupCache.set(id, metadata);
            } catch (err) {
                console.log(err);
            }
        });
    
    sock.ev.on('presence.update', (m) => {
       if (!m) return
       const { id, presences } = m;
       if (id.endsWith('g.us')) {
          for (let jid in presences) {
             if (!presences[jid] || jid == sock.decodeJid(sock.user.id)) continue
             if ((presences[jid].lastKnownPresence === 'composing' || presences[jid].lastKnownPresence === 'recording') && global.db && db.list().user && db.list().user[jid] && db.list().user[jid].afk.afkTime > -1) {
                sock.sendMessage(id, { text: `Sistem mendeteksi aktivitas dari @${jid.replace(/@.+/, '')} setelah offline selama: ${Func.texted('bold', Func.toTime(new Date - db.list().user[jid].afk.afkTime))}\n\n➠ ${Func.texted('bold', 'Reason:')} ${db.list().user[jid].afk.afkReason ? db.list().user[jid].afk.afkReason : '-'}`, mentions: [jid] }, { quoted: db.list().user[jid].afk.afkObj });
                db.list().user[jid].afk.afkTime = -1
                db.list().user[jid].afk.afkReason = ''
                db.list().user[jid].afk.afkObj = {}
             }
          }
       } else { }
    });

    async function getMessage(key) {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id);
        return msg;
      }
      return {
        conversation: "NekoBot",
      };
    }

    sock.ev.on("call", async (calls) => {
      if (!db.list().settings.anticall) return;
      for (const call of calls) {
        if (!call.id || !call.from) continue;
    
        let lastTime = lastCall.get(call.from);
        let now = Date.now();
    
        if (!lastTime || now - lastTime > 5000) {
          lastCall.set(call.from, now);
          await sock.rejectCall(call.id, call.from);
          await sock.sendMessage(call.from, {
            text: "> 🚫 *Mohon maaf*... Kami tidak bisa menerima telepon dari Anda, anti call aktif!",
            mentions: [call.from],
          });
        }
      }
    })
    
    sock.ev.on("messages.upsert", async (cht) => {
        if (cht.messages.length === 0) return;  
        const chatUpdate = cht.messages[0];
        if (!chatUpdate.message) return;    
        const userId = chatUpdate.key.id;
        global.m = await serialize(chatUpdate, sock, store)
        if (m.isBot) {
            if (block_message.has(userId)) return;
            block_message.add(userId);
            setTimeout(() => block_message.delete(userId), 5 * 60 * 1000);
        }
        require("./lib/logger.js")(m);
        await require("./system/handler.js")(m, sock, store);
    });

    sock.ev.on("messages.update", async (chatUpdate) => {
      for (const { key, update } of chatUpdate) {
        if (update.pollUpdates && key.fromMe) {
          const pollCreation = await getMessage(key);
          if (pollCreation) {
            let pollUpdate = await getAggregateVotesInPollMessage({
              message: pollCreation?.message,
              pollUpdates: update.pollUpdates,
            });
            let toCmd = pollUpdate.filter((v) => v.voters.length !== 0)[0]
              ?.name;
            console.log(toCmd);
            await appenTextMessage(m, sock, toCmd, pollCreation);
            await sock.sendMessage(m.cht, { delete: key });
          } else return false;
          return;
        }
      }
    });
    return sock;
  }
  system();
})();

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
