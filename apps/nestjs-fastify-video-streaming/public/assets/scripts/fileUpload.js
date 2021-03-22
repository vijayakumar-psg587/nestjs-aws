async function uploadFile(event) {
  console.log('upload event', event.target);
  const fileNameIp = document.getElementById('largeFileIp');
  const file = fileNameIp.files[0];
  const myHeaders = new Headers();

  myHeaders.append('Content-Length', file.size.toString());
  myHeaders.append('X-Custom-Header', 'videofile');
  myHeaders.append('FID-LOG-TRACKING-ID', '90aba85c-8078-441a-853f-055f9534d2a0');
  myHeaders.append('FID-USER-ID', 'a12345');
  myHeaders.append('FID-USER-TYPE', 'FID_EMP');
  myHeaders.append('FID-PRINCIPAL-ROLE', 'CLIENT');
  myHeaders.append('FID-CONSUMER-APP-PROCESS', 'PM-90aba85c-8078-441a-853f-055f9534d2a0');

  let body = { fileName: file.name, fileType: 'mp4', file: file };
  const formData = new FormData();
  formData.append('fileName', file.name);
  formData.append('fileType', '');
  formData.append('file', file);
  await fetch('http://localhost:3002/file-stream/upload', {
    method: 'PUT',
    body: formData,
    headers: myHeaders,
  })
    .then(response => response.json())
    .then(result => {
      console.log('Success:', result);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function onFileSeleted(event) {
  console.log('file selected:', event);
  document.getElementById('fileNameSpanId').innerText = event.target.files[0].name;
}
