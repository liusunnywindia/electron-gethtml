// @ts-nocheck
import React, { useEffect, useState } from "react";
import HTMLtoDOCX from "html-to-docx";
import { saveAs } from "file-saver";
const Home = () => {
  const [url, setUrl] = useState(
    "https://www.soujianzhu.cn/NormAndRules/gfnr.aspx?id=2295&conid=6112"

  );
  const [show,setShow] = useState(false)
  const [loading,setloading] = useState(false)

  const getHtml = () => {
    if (url == "") {
      return;
    }
    if(loading){
      console.log('请稍后')
      return

    }else{
      setloading(true)
    }   
    let contentDiv = document.getElementById("mycontent");
    contentDiv.innerHTML =''
    window.electron.ipcRenderer.send("gethtml", url);
    // 接收来自主进程的回复
    window.electron.ipcRenderer.on('replyFromMain', (event, arg) => {
      setloading(false)
      setShow(true)
    });
    // 创建div
    window.electron.ipcRenderer.on('createDiv', (event, arg) => {
      var div = document.createElement("div");
      div.innerHTML = arg
      document.getElementById("mycontent").appendChild(div);
    });
  };

  function getModelHtml(mhtml, style = "") {
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
              `;
  }

  const handleDown = async () => {
    let contentDiv = document.getElementById("mycontent");
    const htmlContent = contentDiv.innerHTML;
    // window.electron.ipcRenderer.send('exportToWord', htmlContent||'<p>99</p>');
    let html = getModelHtml(htmlContent);
    let blob = new Blob([html], { type: "application/msword;charset=utf-8" });
    saveAs(blob, "tet" + ".docx");
    //  saveAs(data, "hello.docx");
  };



  return (
    <div className="getHtml">
      <input value={url} onChange={(e) => {setUrl(e.target.value);setShow(false)}} />
      <button onClick={getHtml}>获取</button>
      <div id="mycontent"></div>
      {show&&<div className="downloadContent"><button onClick={handleDown}>下载</button></div>}
      {
        loading&&<div className="loading">请等待</div>
      }
    </div>
  );
};

export default Home;
