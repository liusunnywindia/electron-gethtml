// @ts-nocheck
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
// 在 preload 脚本中。
const { ipcRenderer, contextBridge, remote, shell } = require("electron");
const https = require("https");
const cheerio = require("cheerio");
const path = require('path')
const host= 'https://www.soujianzhu.cn/NormAndRules/'
// const htmlToDocx = require("html-docx-js/dist/html-docx");

const fs = require("fs");
let menuList = [];currentIndex =0
ipcRenderer.on("stopVideo", async (event, value) => {
  let blobNew = dataURLtoBlob(value);
  const blob = new Blob([blobNew], { type: "video/webm" });
  const buffer = Buffer.from(await blob.arrayBuffer());
  console.log(buffer, "buffer");
  var url = window.URL.createObjectURL(blob);
  console.log(url, "url");
  var a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("target", "_blank");
  a.click();
});

function dataURLtoBlob(dataURL) {
  var BASE64_MARKER = ";base64,";
  var parts;
  var contentType;
  var raw;
  if (dataURL.indexOf(BASE64_MARKER) === -1) {
    parts = dataURL.split(",");
    contentType = parts[0].split(":")[1];
    raw = decodeURIComponent(parts[1]);
    return new Blob([raw], { type: contentType });
  }
  parts = dataURL.split(BASE64_MARKER);
  contentType = parts[0].split(":")[1];
  raw = window.atob(parts[1]);
  var rawLength = raw.length;
  var uInt8Array = new Uint8Array(rawLength);
  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: contentType });
}

// ipcRenderer.on("gethtml", async (event, value) => {
//   let url =
//     value ||
//     "https://www.soujianzhu.cn/NormAndRules/gfnr.aspx?id=2295&conid=61127";
//   let html = "";
//   https.get(url, function (res) {
//     res.on("data", function (chunk) {
//       html += chunk;
//     });
//     res.on("end", function () {
//       // console.log(html,'html')
//       var $ = cheerio.load(html);
//       var contentAll = $("#lemmaContent");
//       let categrory = $("#mldl");
//       let arr = categrory.children();
//       arr.each((index, item) => {
//         menuList.push(item.children[0].attribs);
//       });
//       if(menuList.length>0){
//         getAllhtml()
//       }
//     });
//   });
// });

function insertDiv(html) {
  var $ = cheerio.load(html);
  console.log(menuList,'menuList')
  $("#lemmaContent span").each(function (index, element) {
    // 检查是否有data-value属性
    let style = $(this).attr("style");
    const value = $(this).text();
    if (value.indexOf("▼ 展开条文说明") == 0) {
      $(this).remove();
    }
    if (style.includes("display:none")) {
      $(this).attr("style", `${style};display:block`);
    }
  });
  var div = document.createElement("div");
  div.innerHTML = $("#lemmaContent").html(); //将字符串转为div
  document.getElementById("mycontent").appendChild(div);
}

const getAllhtml = () =>{
  const interval = setInterval(() => {
    // 获取当前元素
    const currentItem = menuList[currentIndex];
    let requestUrl =`${host}${currentItem.href}`
    // 发送请求（这里使用 fetch 作为示例）
    let currentHtml = ''
    https.get(requestUrl, function (res) {
      res.on("data", function (chunk) {
        currentHtml += chunk;
      });
      res.on("end", function () {
        console.log(currentHtml,'currentHtml')
        insertDiv(currentHtml);
      });
    });
  
    // 移动到下一个元素
    currentIndex++;
  
    // 如果已经遍历完数组，清除定时器
    if (currentIndex === menuList.length) {
      clearInterval(interval);
      console.log('Array traversal complete');
      ipcRenderer.send("downloadShow", true);
    }
  }, 1000);
}



contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    ...ipcRenderer,
    on: ipcRenderer.on.bind(ipcRenderer),
    removeListener: ipcRenderer.removeListener.bind(ipcRenderer),
  },
});
