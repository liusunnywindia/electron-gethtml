// @ts-nocheck
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
// 在 preload 脚本中。
const { ipcRenderer, contextBridge, remote, shell } = require("electron");
const https = require("https");
const cheerio = require("cheerio");
const htmlToDocx = require("html-docx-js/dist/html-docx");
const fs = require("fs");
// const fs = remote.require('fs');
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

ipcRenderer.on("gethtml", async (event, value) => {
  let url =
    value ||
    "https://www.soujianzhu.cn/NormAndRules/gfnr.aspx?id=2295&conid=61127";
  let html = "";
  https.get(url, function (res) {
    res.on("data", function (chunk) {
      html += chunk;
    });
    res.on("end", function () {
      // console.log(html,'html')
      insertDiv(html);
    });
  });
});

function insertDiv(html) {
  // var dom = cheerio.load(html);
  // console.log(dom,'dom')
  // var a = dom("#lemmaContent");
  // var div = document.createElement("div");
  // div.innerHTML = a.html(); //将字符串转为div
  // console.log(div,'div')
  // document.getElementById("mycontent").appendChild(div);
  let menuList = [];
  var $ = cheerio.load(html);
  var contentAll = $("#lemmaContent");
  let categrory = $("#mldl");
  let arr = categrory.children();
  arr.each((index, item) => {
    menuList.push(item.children[0].attribs);
  });
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
  console.log(div, "div");
  document.getElementById("mycontent").appendChild(div);
}

ipcRenderer.on("exportToWord", async (event, value) => {
  console.log(value)
  // const docx = htmlToDocx(htmlContent);
  // console.log(docx)

})


contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    ...ipcRenderer,
    on: ipcRenderer.on.bind(ipcRenderer),
    removeListener: ipcRenderer.removeListener.bind(ipcRenderer),
  },
});
