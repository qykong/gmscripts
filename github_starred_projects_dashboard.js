// ==UserScript==
// @name         Github homepage with starred project
// @namespace    https://github.com/qykong/gmscripts
// @downloadURL  https://raw.githubusercontent.com/qykong/gmscripts/master/google_scholar_copy_bibtex.js
// @version      0.2
// @description  Add a panel of starred projects blow the "Explore repositories".
// @author       Quyu Kong
// @match        https://github.com/
// @grant        GM.xmlHttpRequest
// ==/UserScript==

function getStarredProjects (url) {
    return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
            method: "GET",
            url: url,
            onload: function(response) {
                if (response.status >= 200 && response.status < 400) {
                    let parser = new DOMParser();
                    let htmlDocument = parser.parseFromString(response.responseText, "text/html");
                    let repos = htmlDocument.querySelectorAll('.col-12.d-block.width-full.py-4.border-bottom');
                    console.log(htmlDocument);
                    let res = Array.prototype.map.call(repos, e => {
                        let descriptionTmp = e.childNodes[5].childNodes;
                        let description = ''
                        if (descriptionTmp.length == 3) {
                            description = descriptionTmp[1].innerHTML.trim();
                        }
                        let repoName = e.childNodes[1].childNodes[1].childNodes[1].href.replace('https://github.com/', '');
                        return [repoName, description];
                    });
                    resolve(res);
                } else {
                    reject(`Failed to load!`);
                }
            }
        });
    });
}

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes
  return div.firstChild;
}

function appendRepos(repos, parentNode) {
    console.log(repos);
    parentNode.appendChild(createElementFromHTML('<h2 class="f5 text-bold mb-1">Starred projects</h2>'));
    repos.forEach(repo => {
        parentNode.appendChild(createElementFromHTML(`<div class="py-2 my-2 border-bottom">
          <a class="f6 text-bold link-gray-dark d-flex no-underline wb-break-all d-inline-block" href="/${repo[0]}">${repo[0]}</a>
          <p class="f6 text-gray mb-2" itemprop="description">
            ${repo[1]}
          </p>

        </div>`));
    })
}

function init(element) {
    let starred_prject_url = Array.prototype.find.call(document.getElementsByClassName('dropdown-item'), e => e.href && e.href.includes('tab=star')).href;
    getStarredProjects(starred_prject_url)
        .then(repos => appendRepos(repos, element))
        .catch(err => console.log(err));
}

/**
 * resolve once a element is on the page
 * @param selector
 * @param interval
 * @param retry
 * @return {Promise<any>}
 */
function detectElement(selector, interval = 500, retry = 10) {
  return new Promise((resolve, reject) => {
    setTimeout(function detect() {
      let dom = document.querySelector(selector);
      if (dom) {
        resolve(dom);
      } else if (retry > 0) {
        setTimeout(detect, interval);
        retry -= 1;
      } else {
        reject(`can not found ${selector} on the page`);
      }
    }, interval);
  });
}

detectElement('[aria-label="Explore"]')
    .then(element => init(element))
    .catch(err => console.log(err))
