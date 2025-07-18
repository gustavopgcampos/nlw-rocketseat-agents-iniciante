const apiKeyInput = document.getElementById('apiKey')
const aiResponse = document.getElementById('aiResponse')
const gameSelectInput = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const form = document.getElementById('form')
const error = document.getElementById('error')

const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}

// async = significa que a função não executa completamente antes de passar por outra tarefa pré definida
const askToAi = async (question, game, apiKey) => {
    const model = 'gemini-2.5-flash'
    const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const questionForAi = `
        ## Especialidade 
        - Você é um especialista assistente de meta para o jogo ${game}
        ## Tarefa
        - Você deve response as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas
        ## Regras
        - Se você não sabe a resposta, responsa com "Não sei" e não tente inventar uma resposta
        - Se a pergunta não está relacionada ao jogo, responda com "Essa pergunta não está relacionada ao jogo"
        - Considere a data atual ${new Date().toLocaleDateString()} e faça pesquisas atualizadas sobre o patch/versão atual baseado na data atual para dar uma responsa coerente
        - Nunca responda itens que você não tenha certeza que está no patch/versão atual
        - Se possível, indique alguns cheats para o ${game} quuando for pedido 
        ## Resposta
        - Economize na resposta, seja direto e responda no máximo 500 caracteres. Responda em markdown
        - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário pergunta
        ## Exemplo de resposta
        - Pergunta do usuário: Como fazer uma espada de ferro no Minecraft?
        - Resposta: Para fazer uma espada na versão mais atual do jogo **patch/versão** mais atual. É necessário os seguintes itens **itens necessários**

        ------

        - Aqui está a pergunta do usuário ${question}
    `

    const contents = [{
        role: 'user',
        parts: [{
            text: questionForAi
        }]
    }]

    const tools = [{
        google_search: {}
    }]

    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const data = await response.json()
    console.log(data)
    return data.candidates[0].content.parts[0].text
}

const sendForm = async (event) => {
    // irá deixar de fazer o padrão
    event.preventDefault()
    const apiKey = apiKeyInput.value
    const game = gameSelectInput.value
    const question = questionInput.value

    if (apiKey == "" || game == "" || question == "") {
        alert("Por favor preencha todos os campos")
        return
    }

    askButton.disabled = true
    askButton.textContent = "PERGUNTANDO..."
    askButton.classList.add('loading')

    try {
        const text = await askToAi(question, game, apiKey)
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
        aiResponse.classList.remove('hide')
    } catch (error) {
        console.log("erro :", error)
    } finally {
        askButton.disabled = false
        askButton.textContent = "PERGUNTAR"
        askButton.classList.remove('loading')
    }

}

form.addEventListener('submit', sendForm)