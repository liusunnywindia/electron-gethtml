// @ts-nocheck
import React,{useEffect, useState} from 'react'
import HTMLtoDOCX from "html-to-docx";
import { saveAs } from "file-saver";
const Home = () =>{
    const [videoUrl,setVideoUrl] = useState('')
    let mediaRecorder = null;let chunks = []
    const startVideo =() =>{
        window.electron.ipcRenderer.send("videoShot",{})
        window.electron.ipcRenderer.on('videoShot', async (event, sourceId) => {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({
                audio: { mandatory: { chromeMediaSource: 'desktop' }},
                video: {
                  mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: sourceId,
                    minWidth: 1280,
                    maxWidth: 1280,
                    minHeight: 700,
                    maxHeight: 700
                  }
                }
              })
              handleStream(stream)
            } catch (e) {
              handleError(e)
            }
          })
          
        
          
      }

      function handleStream (stream) {
        const video = document.querySelector('video')
        video.srcObject = stream
        // video.src = stream
        video.onloadedmetadata = (e) => video.play()
        mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });
        mediaRecorder.ondataavailable = (event) => {
            event.data.size > 0 && chunks.push(event.data);
          };
          mediaRecorder.start();
      
      }

      const handleError = (e) =>{
        console.log('error',e)
      }

      const endVideo = () =>{
        if(!mediaRecorder) return
        mediaRecorder.onstop = async () => {
            console.log('结束',chunks)
            let base64Url = ''
             blobToBase64(chunks[0]).then(res=>{
                base64Url = res
                window.electron.ipcRenderer.send("stopVideo",base64Url)
            })
            
            // const blob = new Blob(chunks, { type: "video/webm" });
            // const buffer = Buffer.from(await blob.arrayBuffer());         
            // const filePath = path.resolve(remote.app.getPath("downloads"), `${Date.now()}.webm`);       
            // fs.writeFile(filePath, buffer, () => {
            // shell.openPath(filePath);
            //   mediaRecorder = null;
            //   chunks = []
            // });
          };
          mediaRecorder.stop();
      }

     function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.onload = (e) => {
            resolve(e.target.result);
          };
          // readAsDataURL
          fileReader.readAsDataURL(blob);
          fileReader.onerror = () => {
            reject(new Error('blobToBase64 error'));
          };
        });
      }

      const getHtml = () => {
        window.electron.ipcRenderer.send("gethtml", '');
      };

      function getModelHtml(mhtml, style = '') {
        return `
              Content-Type: text/html; charset="utf-8"
                <!DOCTYPE html>
                <html>
                <head>
                <style>
                @page {
                  size: A4;
                  margin: 0;
                }
                body {
                  margin: 1cm;
                }
                .nrbtdiv{
                  text-align:center
                }
                </style>
                </head>
                <body>
                  ${mhtml}
                </body>
                </html>
              `
    }

      const handleDown =async() =>{
        let contentDiv = document.getElementById('mycontent')
        const htmlContent = contentDiv.innerHTML;
        let html = getModelHtml(htmlContent)
        let blob = new Blob([html], { type: 'application/msword;charset=utf-8' })
        saveAs(blob, 'tet' + '.docx')
      //  saveAs(data, "hello.docx");
      }

      

    return (
        <div>
        <video controls></video>
        <button onClick={startVideo}>点击录屏</button>
        <button onClick={endVideo}>结束录制</button>
        <button onClick={getHtml}>获取</button>
        <button onClick={handleDown}>下载</button>
        <div id="mycontent"></div>
   </div>
    )
}

export default Home