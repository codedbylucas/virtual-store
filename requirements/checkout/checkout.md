# Checkout

## Request Headers
* x-access-token

## Caso de Sucesso

- ✅ Recebe uma requisição do tipo POST na rota /api/checkout
- ✅ Valida se a requisição foi feita por um usuário
- ✅ Busca carrinho do usuário a partir do userId que estiver no token
- ✅ Busca o email usuário a partir do userId que estiver no token
- ✅ Calcula o valor total dos produtos no carrinho
- ✅ Salva os dados do carrinho no como uma intenção de compra pendente
- ✅ Envia os dados do carrinho junto com o id da intenção de compra, email e id do usuário para e cria uma sessão de pagamento no Stripe
- ✅ Valida o retorno da Api Stripe
- ✅ Retorna 200 com a url da sessão de pagamento


## Exceções

- ✅ Retorna erro 404 se o endpoint não existir
- ✅ Retorna erro 404 se a algum produto do carrinho não estiver disponível
- ✅ Retorna erro 401 se o client não informar o token ou se for inválido
- ✅ Retorna erro 400 se não tiver nenhum produto no carrinho
- ✅ Retorna erro 500 se der erro ao tentar decriptar token do usuário
- ✅ Retorna erro 500 se der erro ao tentar buscar o carrinho do usuário
- ✅ Retorna erro 500 se der erro ao tentar salvar os dados como uma intenção de compra
- ✅ Retorna erro 500 se der erro ao tentar conectar com a Api Stripe

