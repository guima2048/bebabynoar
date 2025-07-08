const fs = require('fs')
const path = require('path')

// Função para otimizar CSS
function optimizeCSS(cssContent) {
  // Remove comentários desnecessários
  cssContent = cssContent.replace(/\/\*[\s\S]*?\*\//g, '')
  
  // Remove espaços em branco extras
  cssContent = cssContent.replace(/\s+/g, ' ')
  
  // Remove quebras de linha desnecessárias
  cssContent = cssContent.replace(/\s*{\s*/g, '{')
  cssContent = cssContent.replace(/\s*}\s*/g, '}')
  cssContent = cssContent.replace(/\s*;\s*/g, ';')
  cssContent = cssContent.replace(/\s*:\s*/g, ':')
  cssContent = cssContent.replace(/\s*,\s*/g, ',')
  
  // Remove espaços no início e fim
  cssContent = cssContent.trim()
  
  return cssContent
}

// Função para extrair CSS crítico
function extractCriticalCSS(cssContent) {
  const criticalSelectors = [
    'html', 'body', 'head', 'title', 'meta', 'link',
    '.loading', '.loaded', '.btn-primary', '.btn-secondary',
    '.card', '.input-field', 'img', '*'
  ]
  
  const lines = cssContent.split('}')
  const criticalCSS = []
  
  lines.forEach(line => {
    const selector = line.split('{')[0]?.trim()
    if (selector && criticalSelectors.some(critical => selector.includes(critical))) {
      criticalCSS.push(line + '}')
    }
  })
  
  return criticalCSS.join('')
}

// Função principal
function main() {
  const cssPath = path.join(__dirname, '../app/globals.css')
  
  if (fs.existsSync(cssPath)) {
    const cssContent = fs.readFileSync(cssPath, 'utf8')
    
    // Extrai CSS crítico
    const criticalCSS = extractCriticalCSS(cssContent)
    
    // Otimiza CSS crítico
    const optimizedCriticalCSS = optimizeCSS(criticalCSS)
    
    // Salva CSS crítico otimizado
    const criticalCSSPath = path.join(__dirname, '../app/critical.css')
    fs.writeFileSync(criticalCSSPath, optimizedCriticalCSS)
    
    console.log('✅ CSS crítico extraído e otimizado')
    console.log(`📊 Tamanho original: ${cssContent.length} bytes`)
    console.log(`📊 Tamanho crítico: ${optimizedCriticalCSS.length} bytes`)
    console.log(`📊 Redução: ${Math.round((1 - optimizedCriticalCSS.length / cssContent.length) * 100)}%`)
  } else {
    console.error('❌ Arquivo CSS não encontrado')
  }
}

if (require.main === module) {
  main()
}

module.exports = { optimizeCSS, extractCriticalCSS } 