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
