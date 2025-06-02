                                                                                                                  prueba.js
// test-puppeteer.mjs
import puppeteer from 'puppeteer-core';

async function testBrowser() {
    console.log('Intentando lanzar Chromium...');
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            // Si sabes la ruta exacta a tu binario de Chromium/Chrome, ponla aquí
            // executablePath: '/usr/bin/google-chrome',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-extensions',
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--no-zygote',
                '--single-process'
            ]
        });
        console.log('Chromium lanzado con éxito.');
        const page = await browser.newPage();
        await page.goto('https://www.google.com');
        console.log('Página cargada con éxito.');
        await browser.close();
        console.log('Navegador cerrado.');
    } catch (error) {
        console.error('¡Error al lanzar o usar Chromium!:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testBrowser();
