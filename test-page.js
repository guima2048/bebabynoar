// Script de teste para verificar a funcionalidade da landing page
const puppeteer = require('puppeteer');

async function testPage() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Capturar erros de console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Erro no console:', msg.text());
      }
    });
    
    // Capturar erros de página
    page.on('pageerror', error => {
      console.log('Erro de página:', error.message);
    });
    
    // Capturar erros de rede
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log('Erro de rede:', response.url(), response.status());
      }
    });
    
    // Navegar para a página
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Aguardar um pouco para carregar o JavaScript
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar se a página carregou corretamente
    const title = await page.title();
    console.log('Título da página:', title);
    
    // Verificar se há elementos da landing page
    const heroTitle = await page.$eval('h1', el => el.textContent);
    console.log('Título do hero:', heroTitle);
    
    // Verificar se a API foi chamada
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/landing-settings');
        return response.ok;
      } catch (error) {
        return false;
      }
    });
    
    console.log('API funcionando:', apiResponse);
    
    console.log('✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
  } finally {
    await browser.close();
  }
}

testPage(); 