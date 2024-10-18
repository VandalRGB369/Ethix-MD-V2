import pkg, { prepareWAMessageMedia } from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import fetch from 'node-fetch';
import config from '../../config.cjs';

const searchRepo = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  const validCommands = ['repo', 'sc', 'script'];

  if (validCommands.includes(cmd)) {
    const repoUrl = `https://api.github.com/repos/Ethix-Xsid/Ethix-MD-V2`;
    
    await handleRepoCommand(m, Matrix, repoUrl);
  }
};

const handleRepoCommand = async (m, Matrix, repoUrl) => {
  try {
    const response = await fetch(repoUrl);
    
    // Check if response is okay
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const repoData = await response.json();
    console.log('API Response:', repoData);

    const {
      full_name,
      name,
      forks_count,
      stargazers_count,
      created_at,
      updated_at,
      owner,
    } = repoData;

    const messageText = `*_Repository Information:_*\n
*_Name:_* ${name}
*_Stars:_* ${stargazers_count}
*_Forks:_* ${forks_count}
*_Created At:_* ${new Date(created_at).toLocaleDateString()}
*_Last Updated:_* ${new Date(updated_at).toLocaleDateString()}
*_Owner:_* ${owner.login}
    `;

    const repoMessage = generateWAMessageFromContent(m.from, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
          },
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
              text: messageText,
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: '© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇᴛʜɪx-ᴍᴅ',
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              ...(await prepareWAMessageMedia({
                image: {
                  url: 'https://telegra.ph/file/fbbe1744668b44637c21a.jpg',
                },
              }, { upload: Matrix.waUploadToServer })),
              title: '',
              gifPlayback: true,
              subtitle: '',
              hasMediaAttachment: false,
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'Contact Owner',
                    id: `${prefix}owner`,
                  }),
                },
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'Click Here To Fork',
                    url: repoUrl.replace('api.', '').replace('repos/', '/forks/'),
                  }),
                },
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'Join Our Community',
                    url: 'https://whatsapp.com/channel/0029VaWJMi3GehEE9e1YsI1S',
                  }),
                },
              ],
            }),
            contextInfo: {
              mentionedJid: [m.sender],
              forwardingScore: 9999,
              isForwarded: true,
            },
          }),
        },
      },
    }, {});

    await Matrix.relayMessage(repoMessage.key.remoteJid, repoMessage.message, {
      messageId: repoMessage.key.id,
    });
    await m.React('✅');
  } catch (error) {
    console.error('Error processing your request:', error.message);
    await m.reply('Error processing your request. Please try again later.');
    await m.React('❌');
  }
};

export default searchRepo;
