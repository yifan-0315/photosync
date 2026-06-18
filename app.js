const CLIENT_ID =
'521487411017-83hp39rfljve10j37ib2p1tjrml55mln.apps.googleusercontent.com';

let accessToken = null;
let folderId = null;

const loginBtn =
  document.getElementById(
    'loginBtn');

const uploadBtn =
  document.getElementById(
    'uploadBtn');

const status =
  document.getElementById(
    'status');

const progress =
  document.getElementById(
    'progress');

loginBtn.onclick =
async () =>
{
  const tokenClient =
    google.accounts.oauth2
      .initTokenClient({

      client_id:
        CLIENT_ID,

      scope:
        'https://www.googleapis.com/auth/drive.file',

      callback:
        async (resp) =>
        {
          accessToken =
            resp.access_token;

          status.innerText =
            '🟢 已登入';

          await initFolder();

          uploadBtn.disabled =
            false;
        }
  });

  tokenClient
    .requestAccessToken();
};

async function initFolder()
{
  folderId =
    localStorage
      .getItem(
        'photosync_folder');

  if (folderId)
  {
    return;
  }

  const response =
    await fetch(
      'https://www.googleapis.com/drive/v3/files?q=name=\'PhotoSyncInbox\' and mimeType=\'application/vnd.google-apps.folder\' and trashed=false',
      {
        headers:
        {
          Authorization:
            `Bearer ${accessToken}`
        }
      });

  const result =
    await response.json();

  if (
      result.files &&
      result.files.length
  )
  {
    folderId =
      result.files[0].id;
  }
  else
  {
    const create =
      await fetch(
        'https://www.googleapis.com/drive/v3/files',
        {
          method:
            'POST',

          headers:
          {
            Authorization:
              `Bearer ${accessToken}`,

            'Content-Type':
              'application/json'
          },

          body:
            JSON.stringify(
            {
              name:
                'PhotoSyncInbox',

              mimeType:
                'application/vnd.google-apps.folder'
            })
        });

    const folder =
      await create.json();

    folderId =
      folder.id;
  }

  localStorage
    .setItem(
      'photosync_folder',
      folderId);
}

uploadBtn.onclick =
async () =>
{
  const files =
    document
      .getElementById(
        'fileInput')
      .files;

  if (!files.length)
  {
    alert(
      '請選擇照片');

    return;
  }

  progress.innerText =
    '';

  let count = 0;

  for (const file of files)
  {
    progress.innerText +=
      `📤 ${file.name}\n`;

    const metadata =
    {
      name:
        file.name,

      parents:
      [
        folderId
      ]
    };

    const form =
      new FormData();

    form.append(
      'metadata',

      new Blob(
      [
        JSON.stringify(
          metadata)
      ],
      {
        type:
          'application/json'
      }));

    form.append(
      'file',
      file);

    const response =
      await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method:
            'POST',

          headers:
          {
            Authorization:
              `Bearer ${accessToken}`
          },

          body:
            form
        });

    if (response.ok)
    {
      count++;

      progress.innerText +=
        `✅ 完成 ${file.name}\n`;
    }
    else
    {
      progress.innerText +=
        `❌ 失敗 ${file.name}\n`;
    }
  }

  progress.innerText +=
    `\n🎉 已完成 ${count} 張照片`;
};
