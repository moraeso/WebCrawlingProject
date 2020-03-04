var express = require('express');
var router = express.Router();

//const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

console.log(puppeteer.executablePath());

/*
const getHtml = async() => {
    try {
        return await axios.get("https://stackoverflow.com/search?q=crawler", {
            headers: {
            }
        });
    } catch (error) {
        console.error(error);
    }
};*/

puppeteer.launch({
    headless: false,
    devtools: false,
    executablePath: puppeteer.executablePath(),
    ignoreDefaultArgs: false,
    timeout: 30000,
    args: ["about:black"]
}).then(async browser => {
    const page = await browser.newPage();
    await page.goto("https://stackoverflow.com/search?q=crawler");
    //browser.close();
    return await page;
}).then(async page => {
    const html = await page.$eval(".js-search-results", e => e.outerHTML);
    // #question-summary-13499040 > div.summary > div.result-link > h3 > a
    // #question-summary-13499040 > div.summary > div.excerpt
    return await cheerio.load(html);
}).then(async data => {
    data('div.search-result').each(function(i, elem) {

        const question = data(elem).find('.summary > .result-link > h3 > a').text()
                                   .replace('\n' + 'Q', 'Q'); // 맨 앞 여백 삭제

        const answerPreview = data(elem).find(".summary > .excerpt").text()
                                    .replace('\n                ','A: ') // 맨 앞 여백 삭제 및 A 추가
                                    .replace(' … \n' + '            ', '…') // 마지막 여백 삭제
                                    .replace('\n\n','\n'); // 2개행 -> 1개행
        console.log("============================================================================");
        console.log(question);
        console.log(answerPreview);
    });
});
/*
getPage()
    .then(page => {
        const html = await page.$eval("")

        let qnaList = [];
        const $ = cheerio.load(html);
        const $bodyList = $("div.question-summary");

        //console.log(html);

        $bodyList.each(function (i, elem) {
            //console.log(i.text());
            qnaList[i] = {
                title: $(this).find('div.summary div.result-link h3 a').text(),
                preview: $(this).find('div.summary div.excerpt').text(),
                url: $(this).find('div.summary div.excerpt').attr('href')
            }
        });

        const data = qnaList.filter(n => n.title);
        return data;
    });
    //.then(res => console.log(res));
*/

module.exports = router;
