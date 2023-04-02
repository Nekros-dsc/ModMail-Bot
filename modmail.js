const Discord = require("discord.js");
const moment = require("moment");
const fs = require("fs")
const config = require("./config.json")
module.exports = client => {

    // Server
    client.on("messageCreate", async (message) => {
        if(message.guild && !message.author.bot) {
            let serverauthor = message.author;
            client.modmailDb.ensure(message.guild.id, {
                enabled: false,
                category: null,
                message: "Commencez à taper ce dont vous avez besoin et obtenez de l'aide !"
            })
            let data = client.modmailDb.get(message.guild.id)
            client.settings.ensure(message.guild.id, {
                prefix: config.prefix
            });
            let prefix = client.settings.get(message.guild.id, `prefix`);
            const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
            if(prefixRegex.test(message.content)) {
                const [, matchedPrefix] = message.content.match(prefixRegex);
                let args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
                let cmd = args.shift()?.toLowerCase(); //PinG --> ping;
                if(cmd.length == 0 && matchedPrefix.includes(client.user.id)){
                    return message.reply({embeds: [
                        new Discord.MessageEmbed().setColor("BLURPLE").setTitle(`:white_check_mark: **Mon préfix est: \`${prefix}\`**`)
                    ]}).catch(console.error);
                }
                if(cmd && cmd.length > 0){
                    if(cmd == "invite" || cmd == "add"){
                        message.reply({
                            embeds: [new Discord.MessageEmbed().setColor("BLURPLE").setTitle(`:white_check_mark: **Merci de m'avoir invité**`)
                            .setDescription(`[**Click ici pour m'inviter!**](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot)`)
                        ]})
                    } else if(cmd == "setup"){
                        if(!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
                            return message.reply({
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("RED")
                                        .setTitle("❌ Seul les admins sont autorisés à utiliser cette commande!")
                                    ]
                            }).catch(console.error)
                        }
                        if(!args[0]){
                            return message.reply({
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("RED")
                                        .setTitle("❌ Utilisation invalide !")
                                        .setDescription(`Utilisation: \`${config.prefix}setup <CategoryId>`)
                                ]
                            }).catch(console.error)
                        }
                        let category = message.guild.channels.cache.get(args[0]);
                        if(!category || category.type != "GUILD_CATEGORY"){
                            return message.reply({
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("RED")
                                        .setTitle("❌ ID de catégorie non valide")
                                        .setDescription(`${args[0]} n'est pas une catégorie !`.substr(0, 2048))
                                ]
                            }).catch(console.error)
                        }
                        client.modmailDb.set(message.guild.id, {
                            enabled: true,
                            category: category.id,
                            message: args[1] ? args.slice(1).join(" ").substr(0, 2000) : "Commencez à taper ce dont vous avez besoin et obtenez de l'aide !"
                        })
                        return message.reply({
                            embeds: [
                                new Discord.MessageEmbed()
                                    .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                    .setTimestamp()
                                    .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                    .setColor("GREEN")
                                    .setTitle("✅ Activé et configuré avec succès la configuration !")
                                ]
                        }).catch(console.error)
                    } 
                    else if(cmd == "deletesetup"){
                        if(!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
                            return message.reply({
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("RED")
                                        .setTitle("❌ Seuls les administrateurs sont autorisés à exécuter cette commande !")
                                    ]
                            }).catch(console.error)
                        }
                        if(!client.modmailDb.has(guild.id)){
                            return message.reply({
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("RED")
                                        .setTitle("❌ Vous n'étiez pas configuré avant !")
                                    ]
                            }).catch(console.error)
                        }
                        client.modmailDb.delete(message.guild.id)
                        return message.reply({
                            embeds: [
                                new Discord.MessageEmbed()
                                    .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                    .setTimestamp()
                                    .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                    .setColor("GREEN")
                                    .setTitle("✅ Suppression réussie de la configuration !")
                                ]
                        }).catch(console.error)
                    }
                    else if(cmd == "forceclose"){
                        if(data.category == message.channel.parentId){
                            let authorId = client.modmailDb.findKey(d => d.id == message.guild.id && d.channel == message.channel.id);
                            if(authorId) client.modmailDb.delete(authorId);
                            return message.reply({
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("GREEN")
                                        .setTitle("✅ Forcer la fermeture de ce ticket")
                                        .setDescription(`VOUS POUVEZ MAINTENANT LE SUPPRIMER SI VOUS LE VOULEZ !`)
                                    ]
                            }).catch(console.error)
                        } else {
                            return message.reply({
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("RED")
                                        .setTitle("❌ Le salon n'est pas un ticket")
                                    ]
                            }).catch(console.error)
                        }
                    }
                    else if(cmd == "close"){
                        if(data.category == message.channel.parentId){
                            let authorId = client.modmailDb.findKey(d => d.id == message.guild.id && d.channel == message.channel.id);
                            if(!authorId) 
                            return message.reply({
                                    embeds: [
                                        new Discord.MessageEmbed()
                                            .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                            .setTimestamp()
                                            .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                            .setColor("RED")
                                            .setTitle("❌ Cette chaîne est fermée / l'utilisateur est parti !")
                                            .setDescription(`Ferme le ticket avec: \`${config.prefix}forceclose\``)
                                        ]
                                }).catch(console.error);
                            let author = message.guild.members.cache.get(authorId);
                            if(!author)
                            author = await message.guild.members.fetch(authorId).catch(e=>{
                                console.log(e)
                                return message.reply({
                                    embeds: [
                                        new Discord.MessageEmbed()
                                            .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                            .setTimestamp()
                                            .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                            .setColor("RED")
                                            .setTitle("❌ L'utilisateur a quitté le serveur")
                                            .setDescription(`Ferme avec: \`${config.prefix}close\``)
                                        ]
                                }).catch(console.error)
                            })
                            if(!author){
                                return message.reply({
                                    embeds: [
                                        new Discord.MessageEmbed()
                                            .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                            .setTimestamp()
                                            .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                            .setColor("RED")
                                            .setTitle("❌ L'utilisateur a quitté le serveur")
                                            .setDescription(`Ferme avec: \`${config.prefix}forceclose\``)
                                        ]
                                }).catch(console.error)
                            }
                            client.modmailDb.delete(authorId);
                            msglimit = 1000;
                        
                            let messageCollection = new Discord.Collection(); 
                            let channelMessages = await message.channel.messages.fetch({ 
                                limit: 100
                            }).catch(err => console.log(err)); 
                            messageCollection = messageCollection.concat(channelMessages); 
                            let tomanymsgs = 1;
                            if (Number(msglimit) === 0) msglimit = 100;
                            let messagelimit = Number(msglimit) / 100; 
                            if (messagelimit < 1) messagelimit = 1; 
                            while (channelMessages.size === 100) { 
                                if (tomanymsgs === messagelimit) break;
                                tomanymsgs += 1; 
                                let lastMessageId = channelMessages.lastKey(); 
                                channelMessages = await message.channel.messages.fetch({
                                    limit: 100,
                                    before: lastMessageId
                                }).catch(err => console.log(err)); 
                                if (channelMessages) 
                                    messageCollection = messageCollection.concat(channelMessages); 
                            }
                           
                            let attachment = [];
                            try {
                                attachment = [await create_transcript_buffer([...messageCollection.values()], message.channel, message.guild)]
                                
                            } catch (e){
                                console.log(e)
                                attachment = []
                            }
                            await author.send({
                                files: attachment,
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("GREEN")
                                        .setTitle("✅ Le supporter a fermé le ticket")
                                    ]
                            }).catch(console.error)
                            await message.author.send({
                                files: attachment,
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("GREEN")
                                        .setTitle("✅ Le supporter a fermé le ticket")
                                    ]
                            }).catch(console.error)
                            await message.reply({
                                files: attachment,
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("GREEN")
                                        .setTitle("✅ Le supporter a fermé le ticket")
                                        .setDescription(`TU PEUX MAINTENANT LE SUPPRIMER SI VOUS LE VOULEZ !`)
                                    ]
                            }).catch(console.error)
                            try{ fs.unlinkSync(`${process.cwd()}/${message.channel.name}.html`)}catch(e){ console.log(e) }
                        } else {
                            return message.reply({
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("RED")
                                        .setTitle("❌ Ce salon n'est pas un ticket !")
                                    ]
                            }).catch(console.error)
                        }
                    } else if(cmd == "help") {
                        let { guild } = message
                        let embeds = []
                        embeds.push(new Discord.MessageEmbed()
                            .setColor("BLURPLE")
                            .setTitle(`Voici mon help`)
                            .setDescription(`Salut je suis ${guild.me.user.username}`)
                            .setThumbnail(guild.me.user.displayAvatarURL())
                            .setAuthor(guild.name, guild.iconURL({dynamic: true})))
                        embeds.push(new Discord.MessageEmbed()
                            .setColor("GREEN")
                            .setTitle(`💯 Commandes utilitaire!`)
                            .setThumbnail(guild.me.user.displayAvatarURL())
                            .addFields([
                                {name: "**ping**", value: `> *Montre le ping du bot.*`, inline: true},
                                {name: "**help**", value: `> *Affiche le help*`, inline: true},
                            ]))
                        embeds.push(new Discord.MessageEmbed()
                            .setColor("RED")
                            .setTitle(`🚫 Commandes Administration!`)
                            .setThumbnail(guild.me.user.displayAvatarURL())
                            .addFields([
                                {name: "**setup**", value: `> *Crée la configuration de votre ticket Modmail*`, inline: true},
                                {name: "**deletesetup**", value: `> *Supprimer la configuration de celui-ci*`, inline: true},
                                {name: "**prefix**", value: `> *Change le préfixe du bot!*`, inline: true},
                                {name: "\u200b", value: `\u200b`, inline: false},
                                {name: "**close**", value: `> *Ferme le ticket (ou utilise mon bouton)*`, inline: true},
                                {name: "**forceclose**", value: `> *Forcer le ferme afin que vous puissiez supprimer le canal et que l'utilisateur puisse en créer de nouveaux*`, inline: true},
                            ])
                            .setFooter(guild.name, guild.iconURL({dynamic: true})))
                        message.reply({embeds})
                    } else if(cmd == "ping"){
                        message.reply({embeds: [
                            new Discord.MessageEmbed().setColor("BLURPLE").setTitle(`:white_check_mark: **Pinger l'API...**`)
                        ]}).then((msg)=>{
                            let botping = (Date.now() - msg.createdTimestamp) - (2 * client.ws.ping);
                            if(botping < 0) botping = 10;
                            msg.edit({embeds: [
                                    new Discord.MessageEmbed().setColor("BLURPLE").setTitle(`> **API PING:** \`${client.ws.ping}\`\n\n> **BOT PING:** \`${botping}\``)
                                ]}).catch(console.error);
                        }).catch(console.error);
                    } else if(cmd == "prefix"){
                        if(!message.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_GUILD)){
                            return message.reply({embeds: [
                                new Discord.MessageEmbed().setColor("RED").setTitle(`:x: **Vous n'êtes pas autorisé à exécuter cette commande**`)
                            ]}).catch(console.error);
                        }
                        
                        if(!args[0]){
                            return message.reply({embeds: [
                                new Discord.MessageEmbed().setColor("RED").setTitle(`:x: **Vous devez me dire quel devrait être le nouveau préfixe**`)
                            ]}).catch(console.error);
                        }
                        //change the prefix settings
                        client.settings.set(message.guild.id, args[0], "prefix");
                        //Send success message
                        return message.reply({embeds: [
                            new Discord.MessageEmbed().setColor("BLURPLE").setTitle(`:white_check_mark: **Le préfixe a été modifié avec succès: \`${args[0]}\`**`)
                        ]}).catch(console.error);
                    }
                }
            }
            if(data.category == message.channel.parentId){
                let authorId = client.modmailDb.findKey(d => d.id == message.guild.id && d.channel == message.channel.id);
                if(!authorId) 
                return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                .setTimestamp()
                                .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                .setColor("RED")
                                .setTitle("❌ Ce salon est fermé / l'utilisateur a quitté!")
                                .setDescription(`Ferme avec: \`${config.prefix}forceclose\``)
                            ]
                    }).catch(console.error);
                let author = message.guild.members.cache.get(authorId);
                if(!author)
                author = await message.guild.members.fetch(authorId).catch(e=>{
                    console.log(e)
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                .setTimestamp()
                                .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                .setColor("RED")
                                .setTitle("❌ L'Utilisateur a quitté le Serveur")
                                .setDescription(`Ferme avec: \`${config.prefix}close\``)
                            ]
                    }).catch(console.error)
                })
                if(!author){
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                .setTimestamp()
                                .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                .setColor("RED")
                                .setTitle("❌ L'Utilisateur a quitté le Serveur")
                                .setDescription(`Ferme avec: \`${config.prefix}close\``)
                            ]
                    }).catch(console.error)
                }
                
                let attachment = [];
                if(message.attachments.size > 0){
                    if(["png", "jpeg", "jpg", "gif"].some(i => message.attachments.first()?.url?.toLowerCase()?.includes(i))){
                        attachment = [new Discord.MessageAttachment(message.attachments.first()?.url)]
                    } else {
                        attachment = [];
                    }
                }
                let embed = new Discord.MessageEmbed()
                .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                .setTimestamp()
                .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                .setColor("GREEN")
                .setTitle("📨 Envoie un nouveau message")
                .setDescription(`${message.content}`.substr(0, 2048))
                .addField(`Plus haut rôle:`, `${message.member.roles.highest.name} | <@&${message.member.roles.highest.id}>`);
                if(attachment.length > 0){
                    console.log(attachment)
                    embed.setImage('attachment://unknown.png');
                }
                author.send({
                    files: attachment,
                    embeds: [embed
                        ]
                }).catch(error=>{
                    console.log(error)
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                            .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                            .setTimestamp()
                            .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                            .setColor("RED")
                            .setTitle("❌ Impossible d'envoyer un message au salon")
                            .setDescription(`\`\`\`${error.message ? String(error.message).substr(0, 2000) : String(e).substr(0, 2000)}\`\`\``)
                           ]
                    }).catch(console.error)
                })
                .then(success=>{
                    message.react("📨").catch(console.error)
                    message.react("✅").catch(console.error)
                });
            }
        
        }
    })

    client.on("ready", () => {
        client.user.setActivity({
            name: "Mp moi ! | m!help | " + client.guilds.cache.size + " Guilds", type: "PLAYING", url: "https://twitch.tv/novaworld"
        })
        setInterval(() => {
            client.user.setActivity({
                name: "Mp moi ! | m!help | " + client.guilds.cache.size + " Guilds", type: "PLAYING", url: "https://twitch.tv/novaworld"
            })
        }, (1000 * 60 * 5));
    })
    // DMS
    client.on("messageCreate", async (message) => {
        if(message.author.bot) return;
        if(!message.guild || message.channel.type == "DM") {
            let dmauthor = message.author;
            if(!client.modmailDb.has(dmauthor.id)){
                
                let guildsin = []

                for(let guild of [... client.guilds.cache.values()]) {
                    try{
                        await guild.members.fetch(dmauthor.id);
                        guildsin.push(guild.id);
                    }catch (e){
                       // console.log(e)
                    }
                }

                if(guildsin.length == 0){
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                                .setTimestamp()
                                .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                                .setColor("RED")
                                .setTitle("❌ Vous ne partagez aucune guilde avec moi !")
                        ]
                    }).catch(console.error)
                }
                else if(guildsin.length == 1){
                    let guild = client.guilds.cache.get(guildsin[0])
                    //he is already in a support mode!
                    client.modmailDb.set(dmauthor.id, {
                        id: guild.id
                    });
                    startSupportProcess(guild, message, dmauthor)
                } 
                else {
                    let selectedid = message.content;
                    let guild = client.guilds.cache.get(selectedid)
                    if(guild){
                        //he is already in a support mode!
                        client.modmailDb.set(dmauthor.id, {
                            id: guild.id
                        });
                        startSupportProcess(guild, message, dmauthor)
                        return;
                    } else {
                        message.reply({
                            embeds: [
                                new Discord.MessageEmbed()
                                    .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                                    .setTimestamp()
                                    .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                                    .setColor("RED")
                                    .setTitle("❌ Impossible de trouver la guilde sous cet ID !! (SI VOUS ESSAYEZ D'EN ENVOYER UN)")
                            ]
                        }).catch(console.error)
                        
                    }
                    let embed = new Discord.MessageEmbed()
                        .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                        .setTimestamp()
                        .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                        .setColor("BLURPLE")
                        .setTitle("✅ Toutes les guildes dans lesquelles nous sommes!")
                        .setDescription(String(guildsin.map(id => `${client.guilds.cache.get(id) ? `**${client.guilds.cache.get(id).name}** (\`${id}\`)`: `\`${id}\``}`).join("\n")).substr(0, 2048))
                        .setFooter("Information : si votre guilde ne s'affiche pas, envoyez simplement l'identifiant de la guilde pour laquelle vous souhaitez obtenir de l'aide !")
                    message.reply({
                        embeds: [
                            embed,
                            new Discord.MessageEmbed()
                                .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                                .setTimestamp()
                                .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                                .setColor("GREEN")
                                .setTitle("👍 Sélectionnez la guilde à laquelle vous souhaitez demander de l'aide !")
                                .setDescription(`**Veuillez envoyer l'identifiant de la GUILD avec laquelle vous souhaitez obtenir de l'aide !**\n\n**Exemple:**\n> \`${guildsin[0]}\``)
                        ]
                    });
                }
            }
            //SUPPORT MESSAGES ETC.            
            else {
                let guild = client.guilds.cache.get(client.modmailDb.get(dmauthor.id, "id"));
                if(!guild) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                                .setTimestamp()
                                .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                                .setColor("RED")
                                .setTitle("❌ Impossible de trouver la GUILD de support, réessayez !")
                            ]
                    }).catch(console.error)
                }
                let channel = guild.channels.cache.get(client.modmailDb.get(dmauthor.id, "channel"));
                if(!channel) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                                .setTimestamp()
                                .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                                .setColor("RED")
                                .setTitle("❌ Impossible de trouver la GUILD de support, réessayez !")
                            ],
                            components: [
                                new Discord.MessageActionRow().addComponents(
                                    new Discord.MessageButton().setStyle("SECONDARY").setLabel("FORCE CLOSE").setCustomId("force_modmail_close").setEmoji("❎")
                                )
                            ]
                    }).catch(console.error)
                }
                let attachment = [];
                if(message.attachments.size > 0){
                    if(["png", "jpeg", "jpg", "gif"].some(i => message.attachments.first()?.url?.toLowerCase()?.includes(i))){
                        attachment = [new Discord.MessageAttachment(message.attachments.first()?.url)]
                    } else {
                        attachment = [];
                    }
                }
                let embed = new Discord.MessageEmbed()
                    .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                    .setTimestamp()
                    .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                    .setColor("GREEN")
                    .setTitle("📨 Envoyé un nouveau message")
                    .setDescription(`${message.content}`.substr(0, 2048))
                if(attachment.length > 0){
                    console.log(attachment)
                    embed.setImage('attachment://unknown.png');
                }
                channel.send({
                    files: attachment,
                    embeds: [embed
                        ]
                }).catch(error=>{
                    console.log(error)
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                            .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                            .setTimestamp()
                            .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                            .setColor("RED")
                            .setTitle("❌ Impossible d'envoyer un message au salon")
                            .setDescription(`\`\`\`${error.message ? String(error.message).substr(0, 2000) : String(e).substr(0, 2000)}\`\`\``)
                           ]
                    }).catch(console.error)
                })
                .then(success=>{
                    message.react("📨").catch(console.error)
                    message.react("✅").catch(console.error)
                });
            }
        }
    })


    client.on("interactionCreate", async interaction => {
        if(interaction.isButton() && interaction.customId == "close_modmail_ticket" && !interaction.guildId){
            let dmauthor = interaction.user;
            if(!client.modmailDb.has(dmauthor.id))
                return interaction.reply({
                    content: "❌ **Vous n'avez plus de Ticket !**",
                    ephemeral: true
                })
            let guild = client.guilds.cache.get(client.modmailDb.get(dmauthor.id, "id"));
            if(!guild) {
                return interaction.reply({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                            .setTimestamp()
                            .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                            .setColor("RED")
                            .setTitle("❌ Impossible de trouver la GUILD de support, réessayez !")
                        ],
                        ephemeral: true
                }).catch(console.error)
            }
            let channel = guild.channels.cache.get(client.modmailDb.get(dmauthor.id, "channel"));
            if(!channel) {
                return interaction.reply({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                            .setTimestamp()
                            .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                            .setColor("RED")
                            .setTitle("❌ Impossible de trouver le canal d'assistance, réessayez !")
                        ],
                        components: [
                            new Discord.MessageActionRow().addComponents(
                                new Discord.MessageButton().setStyle("SECONDARY").setLabel("FORCE CLOSE").setCustomId("force_modmail_close").setEmoji("❎")
                            )
                        ],
                        ephemeral: true
                }).catch(console.error)
            }
            interaction.reply({
                content: "**Ticket fermé**",
                ephemeral: true
            })
            client.modmailDb.delete(dmauthor.id);
            msglimit = 1000;
 
            let messageCollection = new Discord.Collection(); 
            let channelMessages = await channel.messages.fetch({ 
                limit: 100
            }).catch(err => console.log(err)); 
            messageCollection = messageCollection.concat(channelMessages); 
            let tomanymsgs = 1; 
            if (Number(msglimit) === 0) msglimit = 100;
            let messagelimit = Number(msglimit) / 100;
            if (messagelimit < 1) messagelimit = 1;
            while (channelMessages.size === 100) { 
                if (tomanymsgs === messagelimit) break; 
                tomanymsgs += 1; 
                let lastMessageId = channelMessages.lastKey(); 
                channelMessages = await channel.messages.fetch({
                    limit: 100,
                    before: lastMessageId
                }).catch(err => console.log(err)); 
                if (channelMessages) 
                    messageCollection = messageCollection.concat(channelMessages); 
            }
           
            let attachment = [];
            try {
                attachment = [await create_transcript_buffer([...messageCollection.values()], channel, channel.guild)]
            } catch (e){
                console.log(e)
                attachment = []
            }
            await dmauthor.send({
                files: attachment,
                embeds: [
                    new Discord.MessageEmbed()
                        .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                        .setTimestamp()
                        .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                        .setColor("GREEN")
                        .setTitle("✅ TicketUser a fermé le ticket")
                    ]
            }).catch(console.error)
            await channel.send({
                files: attachment,
                embeds: [
                    new Discord.MessageEmbed()
                        .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                        .setTimestamp()
                        .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                        .setColor("GREEN")
                        .setTitle("✅ TicketUser a fermé le ticket")
                    ]
            }).catch(console.error)
            try{ fs.unlinkSync(`${process.cwd()}/${channel.name}.html`)}catch(e){ console.log(e) }
        }
        if(interaction.isButton() && interaction.customId == "force_modmail_close" && !interaction.guildId){
            if(client.modmailDb.has(interaction.user.id)) client.modmailDb.delete(interaction.user.id);
            interaction.reply({
                content: "**Forcer la fermeture du ticket, vous pouvez maintenant en créer de nouveaux !**",
                ephemeral: true
            })
        }
        if(interaction.isButton() && interaction.customId == "close_modmail_ticket" && interaction.guildId){
            let serverauthor = interaction.user;
            let authorId = client.modmailDb.findKey(d => d.id == interaction.message.guild.id && d.channel == interaction.message.channel.id);
            if(!authorId) 
            return interaction.reply({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                            .setTimestamp()
                            .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                            .setColor("RED")
                            .setTitle("❌ Ce canal est fermé / l'utilisateur a quitté!")
                            .setDescription(`Ferme le ticket avec: \`${config.prefix}forceclose\``)
                        ]
                }).catch(console.error);
            let author = interaction.message.guild.members.cache.get(authorId);
            if(!author)
            author = await interaction.message.guild.members.fetch(authorId).catch(e=>{
                console.log(e)
                return interaction.reply({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                            .setTimestamp()
                            .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                            .setColor("RED")
                            .setTitle("❌ L'utilisateur a quitté le serveur")
                            .setDescription(`Ferme le ticket avec: \`${config.prefix}close\``)
                        ]
                }).catch(console.error)
            })
            if(!author){
                return interaction.reply({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                            .setTimestamp()
                            .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                            .setColor("RED")
                            .setTitle("❌ L'utilisateur a quitté le serveur")
                            .setDescription(`Ferme le ticket avec: \`${config.prefix}forceclose\``)
                        ]
                }).catch(console.error)
            }
            interaction.reply({
                content: "**Closed the Ticket!**",
                ephemeral: true
            })
            client.modmailDb.delete(authorId);
            msglimit = 1000;
      
            let messageCollection = new Discord.Collection(); 
            let channelMessages = await interaction.message.channel.messages.fetch({ 
                limit: 100
            }).catch(err => console.log(err));
            messageCollection = messageCollection.concat(channelMessages);
            let tomanymsgs = 1; 
            if (Number(msglimit) === 0) msglimit = 100; 
            let messagelimit = Number(msglimit) / 100; 
            if (messagelimit < 1) messagelimit = 1; 
            while (channelMessages.size === 100) {
                if (tomanymsgs === messagelimit) break;
                tomanymsgs += 1; 
                let lastMessageId = channelMessages.lastKey(); 
                channelMessages = await interaction.message.channel.messages.fetch({
                    limit: 100,
                    before: lastMessageId
                }).catch(err => console.log(err)); 
                if (channelMessages) 
                    messageCollection = messageCollection.concat(channelMessages); 
            }
        
            let attachment = [];
            try {
                attachment = [await create_transcript_buffer([...messageCollection.values()], interaction.message.channel, interaction.message.guild)]
                
            } catch (e){
                console.log(e)
                attachment = []
            }
            await author.send({
                files: attachment,
                embeds: [
                    new Discord.MessageEmbed()
                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                        .setTimestamp()
                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                        .setColor("GREEN")
                        .setTitle("✅ Le supporter a fermé le ticket")
                    ]
            }).catch(console.error)
            await interaction.user.send({
                files: attachment,
                embeds: [
                    new Discord.MessageEmbed()
                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                        .setTimestamp()
                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                        .setColor("GREEN")
                        .setTitle("✅ Le supporter a fermé le ticket")
                    ]
            }).catch(console.error)
            await interaction.message.reply({
                files: attachment,
                embeds: [
                    new Discord.MessageEmbed()
                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                        .setTimestamp()
                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                        .setColor("GREEN")
                        .setTitle("✅ Le supporter a fermé le ticket")
                        .setDescription(`VOUS POUVEZ MAINTENANT LE SUPPRIMER SI VOUS LE VOULEZ !`)
                    ]
            }).catch(console.error)
            try{ fs.unlinkSync(`${process.cwd()}/${channel.name}.html`)}catch(e){  }
        }
    })

    //security
    client.on("channelDelete", channel => {
        if(channel.guild){
            let authorId = client.modmailDb.findKey(d => d.id == channel.guild.id && d.channel == channel.id);
            if(authorId) client.modmailDb.delete(authorId);
        }
    })
    
    function startSupportProcess(guild, message, dmauthor){
        client.modmailDb.ensure(guild.id, {
            enabled: false,
            category: null,
            message: "Commencez à taper ce dont vous avez besoin et obtenez de l'aide !"
        })
        let data = client.modmailDb.get(guild.id)
        if(!data.enabled){
            client.modmailDb.delete(dmauthor.id);
            return message.reply({
                embeds: [
                    new Discord.MessageEmbed()
                        .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                        .setTimestamp()
                        .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                        .setColor("RED")
                        .setTitle("❌ Cette guilde n'est pas encore configurée !")
                        .setDescription(`un administrateur peut le faire avec \`${config.prefix}setup\``)
                ]
            }).catch(console.error)
        }
        let category = guild.channels.cache.get(data.category);
        if(category && category.type == "GUILD_CATEGORY") {
            if(category.children.size >= 50){
                category == null;
            }
        }
        guild.channels.create(`${dmauthor.username}`.substr(0, 32) , {
            type: "GUILD_TEXT",
            topic: `Modmail Ticket pour: ${dmauthor.tag} | ${dmauthor.id}`,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: ["VIEW_CHANNEL"]
                }
            ]
        }).then(channel => {
            if(category) {
                channel.setParent(category.id);
            }
            client.modmailDb.set(dmauthor.id, channel.id, "channel");
            message.reply({
                embeds: [
                    new Discord.MessageEmbed()
                    .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                    .setTimestamp()
                    .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                    .setColor("BLURPLE")
                    .setTitle("✅ Création réussie de votre ticket d'assistance !")
                    .setDescription(`${data.message}`)
                    .addField("Visibilité", `${!category ? "Seul les admins peuvent voir" : "Utilisation des paramètres de sa catégorie"}`)
                   ],
                   components: [ new Discord.MessageActionRow().addComponents(new Discord.MessageButton()
                    .setStyle("DANGER").setEmoji("💥").setLabel("Ferme le ticket").setCustomId("close_modmail_ticket"))]
            }).catch(console.error)
            channel.send({
                embeds: [
                    new Discord.MessageEmbed()
                    .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                    .setTimestamp()
                    .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                    .setColor("GREEN")
                    .setTitle("✅ Created an Support Ticket!")
                    .addField("Visibility", `${!category ? "Seul les admins peuvent voir!" : "Utilisation des paramètres de sa catégorie"}`)
                   ],
                   components: [ new Discord.MessageActionRow().addComponents(new Discord.MessageButton()
                    .setStyle("DANGER").setEmoji("💥").setLabel("Fermer le ticket").setCustomId("close_modmail_ticket"))]
            }).catch(console.error)
            //START THE SUPPORTING HELP!
        }).catch(error=>{
            console.log(error)
            client.modmailDb.delete(dmauthor.id);
            return message.reply({
                embeds: [
                    new Discord.MessageEmbed()
                    .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                    .setTimestamp()
                    .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                    .setColor("RED")
                    .setTitle("❌ Échec de la création du ticket d'assistance ! | ANNULÉ")
                    .setDescription(`\`\`\`${error.message ? String(error.message).substr(0, 2000) : String(e).substr(0, 2000)}\`\`\``)
                   ]
            }).catch(console.error)
        })
    }
}

/**
 *  CREATEING A TRANSCRIPT
 * @param {*} Messages 
 * @param {*} Channel 
 * @param {*} Guild 
 * @returns ticketname.html FILE
 */

async function create_transcript_buffer(Messages, Channel, Guild){
    return new Promise(async (resolve, reject) => {
      try{
        let baseHTML = `<!DOCTYPE html>` + 
        `<html lang="en">` + 
        `<head>` + 
        `<title>${Channel.name}</title>` + 
        `<meta charset="utf-8" />` + 
        `<meta name="viewport" content="width=device-width" />` + 
        `<style>mark{background-color: #202225;color:#F3F3F3;}@font-face{font-family:Whitney;src:url(https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/whitney-300.woff);font-weight:300}@font-face{font-family:Whitney;src:url(https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/whitney-400.woff);font-weight:400}@font-face{font-family:Whitney;src:url(https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/whitney-500.woff);font-weight:500}@font-face{font-family:Whitney;src:url(https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/whitney-600.woff);font-weight:600}@font-face{font-family:Whitney;src:url(https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/whitney-700.woff);font-weight:700}body{font-family:Whitney,"Helvetica Neue",Helvetica,Arial,sans-serif;font-size:17px}a{text-decoration:none}a:hover{text-decoration:underline}img{object-fit:contain}.markdown{max-width:100%;line-height:1.3;overflow-wrap:break-word}.preserve-whitespace{white-space:pre-wrap}.spoiler{display:inline-block}.spoiler--hidden{cursor:pointer}.spoiler-text{border-radius:3px}.spoiler--hidden .spoiler-text{color:transparent}.spoiler--hidden .spoiler-text::selection{color:transparent}.spoiler-image{position:relative;overflow:hidden;border-radius:3px}.spoiler--hidden .spoiler-image{box-shadow:0 0 1px 1px rgba(0,0,0,.1)}.spoiler--hidden .spoiler-image *{filter:blur(44px)}.spoiler--hidden .spoiler-image:after{content:"SPOILER";color:#dcddde;background-color:rgba(0,0,0,.6);position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-weight:600;padding:100%;border-radius:20px;letter-spacing:.05em;font-size:.9em}.spoiler--hidden:hover .spoiler-image:after{color:#fff;background-color:rgba(0,0,0,.9)}blockquote{margin:.1em 0;padding-left:.6em;border-left:4px solid;border-radius:3px}.pre{font-family:Consolas,"Courier New",Courier,monospace}.pre--multiline{margin-top:.25em;padding:.5em;border:2px solid;border-radius:5px}.pre--inline{padding:2px;border-radius:3px;font-size:.85em}.mention{border-radius:3px;padding:0 2px;color:#dee0fc;background:rgba(88,101,242,.3);font-weight:500}.mention:hover{background:rgba(88,101,242,.6)}.emoji{width:1.25em;height:1.25em;margin:0 .06em;vertical-align:-.4em}.emoji--small{width:1em;height:1em}.emoji--large{width:2.8em;height:2.8em}.chatlog{max-width:100%}.message-group{display:grid;margin:0 .6em;padding:.9em 0;border-top:1px solid;grid-template-columns:auto 1fr}.reference-symbol{grid-column:1;border-style:solid;border-width:2px 0 0 2px;border-radius:8px 0 0 0;margin-left:16px;margin-top:8px}.attachment-icon{float:left;height:100%;margin-right:10px}.reference{display:flex;grid-column:2;margin-left:1.2em;margin-bottom:.25em;font-size:.875em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;align-items:center}.reference-av{border-radius:50%;height:16px;width:16px;margin-right:.25em}.reference-name{margin-right:.25em;font-weight:600}.reference-link{flex-grow:1;overflow:hidden;text-overflow:ellipsis}.reference-link:hover{text-decoration:none}.reference-content>*{display:inline}.reference-edited-tst{margin-left:.25em;font-size:.8em}.ath-av-container{grid-column:1;width:40px;height:40px}.ath-av{border-radius:50%;height:40px;width:40px}.messages{grid-column:2;margin-left:1.2em;min-width:50%}.messages .bot-tag{top:-.2em}.ath-name{font-weight:500}.tst{margin-left:.3em;font-size:.75em}.message{padding:.1em .3em;margin:0 -.3em;background-color:transparent;transition:background-color 1s ease}.content{font-size:.95em;word-wrap:break-word}.edited-tst{margin-left:.15em;font-size:.8em}.attachment{margin-top:.3em}.attachment-thumbnail{vertical-align:top;max-width:45vw;max-height:225px;border-radius:3px}.attachment-container{height:40px;width:100%;max-width:520px;padding:10px;border:1px solid;border-radius:3px;overflow:hidden;background-color:#2f3136;border-color:#292b2f}.attachment-icon{float:left;height:100%;margin-right:10px}.attachment-filesize{color:#72767d;font-size:12px}.attachment-filename{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.embed{display:flex;margin-top:.3em;max-width:520px}.embed-color-pill{flex-shrink:0;width:.25em;border-top-left-radius:3px;border-bottom-left-radius:3px}.embed-content-container{display:flex;flex-direction:column;padding:.5em .6em;border:1px solid;border-top-right-radius:3px;border-bottom-right-radius:3px}.embed-content{display:flex;width:100%}.embed-text{flex:1}.embed-ath{display:flex;margin-bottom:.3em;align-items:center}.embed-ath-icon{margin-right:.5em;width:20px;height:20px;border-radius:50%}.embed-ath-name{font-size:.875em;font-weight:600}.embed-title{margin-bottom:.2em;font-size:.875em;font-weight:600}.embed-description{font-weight:500;font-size:.85em}.embed-fields{display:flex;flex-wrap:wrap}.embed-field{flex:0;min-width:100%;max-width:506px;padding-top:.6em;font-size:.875em}.embed-field--inline{flex:1;flex-basis:auto;min-width:150px}.embed-field-name{margin-bottom:.2em;font-weight:600}.embed-field-value{font-weight:500}.embed-thumbnail{flex:0;margin-left:1.2em;max-width:80px;max-height:80px;border-radius:3px}.embed-image-container{margin-top:.6em}.embed-image{max-width:500px;max-height:400px;border-radius:3px}.embed-footer{margin-top:.6em}.embed-footer-icon{margin-right:.2em;width:20px;height:20px;border-radius:50%;vertical-align:middle}.embed-footer-text{display:inline;font-size:.75em;font-weight:500}.reactions{display:flex}.reaction{display:flex;align-items:center;margin:.35em .1em .1em .1em;padding:.2em .35em;border-radius:8px}.reaction-count{min-width:9px;margin-left:.35em;font-size:.875em}.bot-tag{position:relative;margin-left:.3em;margin-right:.3em;padding:.05em .3em;border-radius:3px;vertical-align:middle;line-height:1.3;background:#7289da;color:#fff;font-size:.625em;font-weight:500}.postamble{margin:1.4em .3em .6em .3em;padding:1em;border-top:1px solid}body{background-color:#36393e;color:#dcddde}a{color:#0096cf}.spoiler-text{background-color:rgba(255,255,255,.1)}.spoiler--hidden .spoiler-text{background-color:#202225}.spoiler--hidden:hover .spoiler-text{background-color:rgba(32,34,37,.8)}.quote{border-color:#4f545c}.pre{background-color:#2f3136!important}.pre--multiline{border-color:#282b30!important;color:#b9bbbe!important}.preamble__entry{color:#fff}.message-group{border-color:rgba(255,255,255,.1)}.reference-symbol{border-color:#4f545c}.reference-icon{width:20px;display:inline-block;vertical-align:bottom}.reference{color:#b5b6b8}.reference-link{color:#b5b6b8}.reference-link:hover{color:#fff}.reference-edited-tst{color:rgba(255,255,255,.2)}.ath-name{color:#fff}.tst{color:rgba(255,255,255,.2)}.message--highlighted{background-color:rgba(114,137,218,.2)!important}.message--pinned{background-color:rgba(249,168,37,.05)}.edited-tst{color:rgba(255,255,255,.2)}.embed-color-pill--default{background-color:#4f545c}.embed-content-container{background-color:rgba(46,48,54,.3);border-color:rgba(46,48,54,.6)}.embed-ath-name{color:#fff}.embed-ath-name-link{color:#fff}.embed-title{color:#fff}.embed-description{color:rgba(255,255,255,.6)}.embed-field-name{color:#fff}.embed-field-value{color:rgba(255,255,255,.6)}.embed-footer{color:rgba(255,255,255,.6)}.reaction{background-color:rgba(255,255,255,.05)}.reaction-count{color:rgba(255,255,255,.3)}.info{display:flex;max-width:100%;margin:0 5px 10px 5px}.guild-icon-container{flex:0}.guild-icon{max-width:88px;max-height:88px}.metadata{flex:1;margin-left:10px}.guild-name{font-size:1.2em}.channel-name{font-size:1em}.channel-topic{margin-top:2px}.channel-message-count{margin-top:2px}.channel-timezone{margin-top:2px;font-size:.9em}.channel-date-range{margin-top:2px}</style>` +
        `<script>function scrollToMessage(e,t){var o=document.getElementById("message-"+t);null!=o&&(e.preventDefault(),o.classList.add("message--highlighted"),window.scrollTo({top:o.getBoundingClientRect().top-document.body.getBoundingClientRect().top-window.innerHeight/2,behavior:"smooth"}),window.setTimeout(function(){o.classList.remove("message--highlighted")},2e3))}function scrollToMessage(e,t){var o=document.getElementById("message-"+t);o&&(e.preventDefault(),o.classList.add("message--highlighted"),window.scrollTo({top:o.getBoundingClientRect().top-document.body.getBoundingClientRect().top-window.innerHeight/2,behavior:"smooth"}),window.setTimeout(function(){o.classList.remove("message--highlighted")},2e3))}function showSpoiler(e,t){t&&t.classList.contains("spoiler--hidden")&&(e.preventDefault(),t.classList.remove("spoiler--hidden"))}</script>` + 
        `<script>document.addEventListener('DOMContentLoaded', () => {document.querySelectorAll('.pre--multiline').forEach((block) => {hljs.highlightBlock(block);});});</script>` + 
        `</head>`;
        let messagesArray = []
        let messagescount = Messages.length;
        let msgs = Messages.reverse(); //reverse the array to have it listed like the discord chat
        //now for every message in the array make a new paragraph!
        await msgs.forEach(async msg => {
            //Aug 02, 2021 12:20 AM
            if(msg.type == "DEFAULT"){
              let time = moment(msg.createdTimestamp).format("MMM DD, YYYY HH:MM:ss")
              let subcontent = `<div class="message-group">` + 
              `<div class="ath-av-container"><img class="ath-av"src="${msg.author.displayAvatarURL({dynamic: true})}" /></div>` + 
              `<div class="messages">` + 
              `<span class="ath-name" title="${msg.author.username}" style="color: ${msg.member.roles.highest.hexColor};">${msg.author.tag}</span>`;
              if(msg.author.bot) subcontent += `<span class="bot-tag">BOT</span>`;
              subcontent += `<span class="tst">ID: ${msg.author.id} | </span>` + 
              `<span class="tst">${time} ${msg.editedTimestamp ? `(edited)` : msg.editedAt ? `(edited)` : ""}</span>` + 
              `<div class="message">`;
              if (msg.content) {
                subcontent += `<div class="content"><div class="markdown"><span class="preserve-whitespace">${markdowntohtml(String(msg.cleanContent ? msg.cleanContent : msg.content).replace(/\n/ig, "<br/>"))}</div></div>` 
              } 
              if (msg.embeds[0]){
                  subcontent += `<div class="embed"><div class=embed-color-pill style=background-color:"${msg.embeds[0].color ? msg.embeds[0].color : "transparent"}"></div><div class=embed-content-container><div class=embed-content><div class=embed-text>` 
                  
                  if(msg.embeds[0].author){
                    subcontent += `<div class="embed-ath">`;
                    if(msg.embeds[0].author.iconURL){
                      subcontent += `<img class="embed-ath-icon" src="${msg.embeds[0].author.iconURL}">`
                    }
                    if(msg.embeds[0].author.name){
                      subcontent += `<div class="embed-ath-name"><span class="markdown">${markdowntohtml(String(msg.embeds[0].author.name).replace(/\n/ig, "<br/>"))}</span></div>`
                    }
                    subcontent += `</div>`
                  }if(msg.embeds[0].title){
                    subcontent += `<div class="embed-title"><span class="markdown">${markdowntohtml(String(msg.embeds[0].title).replace(/\n/ig, "<br/>"))}</span></div>`;
                  }
                  if(msg.embeds[0].description){
                    subcontent += `<div class="embed-description preserve-whitespace"><span class="markdown" style="color: rgba(255,255,255,.6) !important;">${markdowntohtml(String(msg.embeds[0].description).replace(/\n/ig, "<br/>"))}</span></div>`;
                  }
                  if(msg.embeds[0].image){
                    subcontent += `<div class="embed-image-container"><img class="embed-footer-image" src="${msg.embeds[0].image.url}"></div>`
                  }
                  if(msg.embeds[0].fields && msg.embeds[0].fields.length > 0){
                    subcontent += `<div class="embed-fields">`
                    for(let i = 0; i < msg.embeds[0].fields.length; i++){
                        subcontent += `<div class="embed-field ${msg.embeds[0].fields[i].inline ? `embed-field--inline` : ``}">`
                        const field = msg.embeds[0].fields[i]
                        if(field.key){
                          subcontent += `<div class="embed-field-name">${markdowntohtml(String(field.key).replace(/\n/ig, "<br/>"))}</div>`;
                        }
                        if(field.value){
                          subcontent += `<div class="embed-field-value">${markdowntohtml(String(field.value).replace(/\n/ig, "<br/>"))}</div>`;
                        }
                        subcontent += `</div>`
                    }
                    subcontent += `</div>`;
                  }
                  if(msg.embeds[0].footer){
                    subcontent += `<div class="embed-footer">`;
                    if(msg.embeds[0].footer.iconURL){
                      subcontent += `<img class="embed-footer-icon" src="${msg.embeds[0].footer.iconURL}">`
                    }
                    if(msg.embeds[0].footer.text){
                      subcontent += `<div class="embed-footer-text"><span class="markdown">${markdowntohtml(String(msg.embeds[0].footer.text).replace(/\n/ig, "<br/>"))}</span></div>`
                    }
                    subcontent += `</div>`
                  }
                  subcontent += `</div>`;
                  if(msg.embeds[0].thumbnail && msg.embeds[0].thumbnail.url){
                    subcontent += `<img class="embed-thumbnail" src="${msg.embeds[0].thumbnail.url}">`;
                  }
                  subcontent += `</div></div></div>`;
              }
              if (msg.reactions && msg.reactions.cache.size > 0){
                subcontent += `<div class="reactions">`
                for(const reaction of [...msg.reactions.cache.values()]){                      
                  subcontent += `<div class=reaction>${reaction.emoji.url ? `<img class="emoji emoji--small" src="${reaction.emoji.url}" alt="${"<" + reaction.emoji.animated ? "a" : "" + ":" + reaction.emoji.name + ":" + reaction.emoji.id + ">"}">` : reaction.emoji.name.toString()}<span class="reaction-count">${reaction.count}</span></div>`
                }
                subcontent += `</div>`
              }
              subcontent += `</div></div></div>`
              messagesArray.push(subcontent);
            }
            if(msg.type == "PINS_ADD"){
              let time = moment(msg.createdTimestamp).format("MMM DD, YYYY HH:MM:ss")
              let subcontent = `<div class="message-group">` + 
              `<div class="ath-av-container"><img class="ath-av"src="https://cdn-0.emojis.wiki/emoji-pics/twitter/pushpin-twitter.png" style="background-color: #000;filter: alpha(opacity=40);opacity: 0.4;" /></div>` + 
              `<div class="messages">` + 
              `<span class="ath-name" title="${msg.author.username}" style="color: ${msg.member.roles.highest.hexColor};">${msg.author.tag}</span>`;
              if(msg.author.bot) subcontent += `<span class="bot-tag">BOT</span>`;
              subcontent += `<span class="tst" style="font-weight:500;color:#848484;font-size: 14px;">pinned a message to this channel.</span><span class="tst">${time}</span></div></div></div>`;
            messagesArray.push(subcontent);
            }
        });
        baseHTML += `<body><div class="info"><div class="guild-icon-container"> <img class="guild-icon" src="${Guild.iconURL({dynamic:true})}" />` +
          `</div><div class="metadata">` +
          `<div class="guild-name"><strong>Guild:</strong> ${Guild.name} (<mark>${Guild.id})</mark></div>` +
          `<div class="channel-name"><strong>Channel:</strong> ${Channel.name} (<mark>${Channel.id})</mark></div>` +
          `<div class="channel-message-count"><mark>${messagescount} Messages</mark></div>` +
          `<div class="channel-timezone"><strong>Timezone-Log-Created:</strong> <mark>${moment(Date.now()).format("MMM DD, YYYY HH:MM")}</mark> | <em>[MEZ] Europe/London</em></div>` +
          `</div></div>` +
          `<div class="chatlog">`;
          baseHTML += messagesArray.join("\n");
          baseHTML += `<div class="message-group"><div class="ath-av-container"><img class="ath-av"src="https://logosmarken.com/wp-content/uploads/2020/12/Discord-Logo.png" /></div><div class="messages"><span class="ath-name" style="color: #ff5151;">TICKET LOG INFORMATION</span><span class="bot-tag">✓ SYSTEM</span><span class="timestamp">Mind this Information</span><div class="message " ><div class="content"><div class="markdown"><span class="preserve-whitespace"><i><blockquote>If there are Files, Attachments, Vidoes or Images, they won't always be displayed cause they will be unknown and we don't want to spam an API like IMGUR!</blockquote></i></span></div></div></div></div></div></div></body></html>`;
        fs.writeFileSync(`${process.cwd()}/${Channel.name}.html`, baseHTML); //write everything in the docx file
        resolve(`${process.cwd()}/${Channel.name}.html`);
        return;
        function markdowntohtml(tomarkdown){
          mentionReplace(tomarkdown.split(" "));
          function mentionReplace(splitted){
            for(arg of splitted){
              const memberatches = arg.match(/<@!?(\d+)>/);
              const rolematches = arg.match(/<@&(\d+)>/);
              const channelmatches = arg.match(/<#(\d+)>/);
              if (rolematches) {
                let role = Guild.roles.cache.get(rolematches[1])
                if(role){
                  let torpleace = new RegExp(rolematches[0], "g")
                  tomarkdown = tomarkdown.replace(torpleace, `<span title="${role.id}" style="color: ${role.hexColor};">@${role.name}</span>`);
                }
              }
              if(memberatches){
                let member = Guild.members.cache.get(memberatches[1])
                if(member){
                  let torpleace = new RegExp(memberatches[0], "g")
                  tomarkdown = tomarkdown.replace(torpleace, `<span class="mention" title="${member.id}">@${member.user.username}</span>`);
                }
              }
              if(channelmatches){
                let channel = Guild.channels.cache.get(channelmatches[1])
                if(channel){
                  let torpleace = new RegExp(channelmatches[0], "g")
                  tomarkdown = tomarkdown.replace(torpleace, `<span class="mention" title="${channel.id}">@${channel.name}</span>`);
                }
              }
            }
          }
          var output = "";
          var BLOCK = "block";
          var INLINE = "inline";
          var parseMap = [
            {
              // <p>
              pattern: /\n(?!<\/?\w+>|\s?\*|\s?[0-9]+|>|\&gt;|-{5,})([^\n]+)/g,
              replace: "$1<br/>",
              type: BLOCK,
            },
            {
              // <blockquote>
              pattern: /\n(?:&gt;|\>)\W*(.*)/g,
              replace: "<blockquote><p>$1</p></blockquote>",
              type: BLOCK,
            },
            {
              // <ul>
              pattern: /\n\s?\*\s*(.*)/g,
              replace: "<ul>\n\t<li>$1</li>\n</ul>",
              type: BLOCK,
            },
            {
              // <ol>
              pattern: /\n\s?[0-9]+\.\s*(.*)/g,
              replace: "<ol>\n\t<li>$1</li>\n</ol>",
              type: BLOCK,
            },
            {
              // <strong>
              pattern: /(\*\*|__)(.*?)\1/g,
              replace: "<strong>$2</strong>",
              type: INLINE,
            },
            {
              // <em>
              pattern: /(\*)(.*?)\1/g,
              replace: "<em>$2</em>",
              type: INLINE,
            },
            {
              // <a>
              pattern: /([^!])\[([^\[]+)\]\(([^\)]+)\)/g,
              replace: "$1<a href=\"$3\">$2</a>",
              type: INLINE,
            },
            {
              // <img>
              pattern: /!\[([^\[]+)\]\(([^\)]+)\)/g,
              replace: "<img src=\"$2\" alt=\"$1\" />",
              type: INLINE,
            },
            {
              // <code>
              pattern: /`(.*?)`/g,
              replace: "<mark>$1</mark>",
              type: INLINE,
            },
          ];
          function parse(string) {
            output = "\n" + string + "\n";
            parseMap.forEach(function(p) {
              output = output.replace(p.pattern, function() {
                return replace.call(this, arguments, p.replace, p.type);
              });
            });
            output = clean(output);
            output = output.trim();
            output = output.replace(/[\n]{1,}/g, "\n");
            return output;
          }
          function replace(matchList, replacement, type) {
            var i, $$;
            for(i in matchList) {
              if(!matchList.hasOwnProperty(i)) {
                continue;
              }
              replacement = replacement.split("$" + i).join(matchList[i]);
              replacement = replacement.split("$L" + i).join(matchList[i].length);
            }
            if(type === BLOCK) {
              replacement = replacement.trim() + "\n";
            }
            return replacement;
          }
          function clean(string) {
            var cleaningRuleArray = [
              {
                match: /<\/([uo]l)>\s*<\1>/g,
                replacement: "",
              },
              {
                match: /(<\/\w+>)<\/(blockquote)>\s*<\2>/g,
                replacement: "$1",
              },
            ];
            cleaningRuleArray.forEach(function(rule) {
              string = string.replace(rule.match, rule.replacement);
            });
            return string;
          }
          
          let output__ = parse(tomarkdown);
          return output__;
        }
      }catch (e){
        reject(e);
        return;
      }
    })          
}

/**
 *  LEAVING THE PREFIX
 * @param {*} str 
 * @returns prefix/ping
 */
function escapeRegex(str){
    return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
}