// ==UserScript==
// @name         Google scholar copy bibtex
// @namespace    http://tampermonkey.net/
// @downloadURL  https://raw.githubusercontent.com/qykong/gmscripts/master/google_scholar_copy_bibtex.js
// @version      0.2
// @description  Copy bibtex on google scholar with one click
// @author       Quyu Kong
// @supportURL   https://github.com/qykong/gmscripts/issues
// @include      https://scholar.google.*
// @run-at       document-start
// @grant        GM.xmlHttpRequest
// @grant        GM.setClipboard
// @connect      scholar.googleusercontent.com
// ==/UserScript==

var chosen_button = null;

function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
XMLHttpRequest.prototype.realSend = XMLHttpRequest.prototype.send;

function mySend() {
    if (this.realonreadystatechange == undefined) this.realonreadystatechange = this.onreadystatechange
    this.onreadystatechange = () => {
      if (this.readyState == 4 && this.status == 200) {
          var url = this.responseText.match('href="(.*?)">BibTeX')[1].replaceAll('amp;', '');
          GM.xmlHttpRequest({
              method: "GET",
              url: url,
              onload: function(response) {
                  if (response.status >= 200 && response.status < 400) {
                      GM.setClipboard(response.responseText);
                      if (chosen_button != null) {
                          chosen_button.innerHTML = 'Copied!';
                          var saved_button = chosen_button;
                          chosen_button = null;
                          setTimeout(() => {saved_button.innerHTML = 'Copy BibTex'; }, 5000);
                      }
                  } else {
                      if (chosen_button != null) {
                          chosen_button.innerHTML = 'Copy BibTex';
                          chosen_button = null;
                          alert('Failed to copy. Check if you are able to open: ' + url);
                      }
                  }
              }
          });
      }
      this.realonreadystatechange();
    }
    //call original
    this.realSend();
}

function hideCitationModal() {
    document.getElementById('gs_md_s').setAttribute('style', 'visibility:hidden;');
    document.getElementById('gs_cit').setAttribute('style', 'display:none;');
}

function showCitationModal() {
    document.getElementById('gs_md_s').removeAttribute('style');
    document.getElementById('gs_cit').removeAttribute('style');
}

function init() {
    var buttons = document.getElementsByClassName('gs_or_cit');
    Array.prototype.forEach.call(buttons, function(button) {
        var e = document.createElement('a');
        e.innerHTML = 'Copy BibTex';
        e.setAttribute('class', 'gs_fl');
        e.setAttribute('href', 'javascript:void(0)');
        insertAfter(button, e);
        e.addEventListener('click', function(c) {
            e.innerHTML = 'Loading...';
            chosen_button = e;
            button.click();
            hideCitationModal();
        });

        button.addEventListener('click', function(b) {
            showCitationModal();
        })
    });

    XMLHttpRequest.prototype.send = mySend;
}

document.addEventListener("DOMContentLoaded", init);
