import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// --- PROVA DE VIDA ---
// Se você não vir isso no console do navegador (F12), o arquivo não é este.
console.log("--- PROVA DE VIDA: App.jsx LIMPO (v2) CARREGADO ---");

// --- CONFIGURAÇÃO DO AXIOS ---
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // O endereço do nosso back-end
  timeout: 5000 // Timeout de 5 segundos
});

const API_URL_LOGIN = 'http://localhost:8080/api/login';

// --- COMPONENTE DE LOGIN ---
function LoginForm({ onLogin }) {
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!codigo || !nome || !password) {
      setError('Por favor, preencha todos os campos.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(API_URL_LOGIN, {
        codigo: codigo,
        nome: nome,
        password: password,
      });
      
      console.log('Login efetuado com sucesso!', response.data);
      onLogin(true); // <--- Isso é o que muda a tela!

    } catch (err) {
      console.error('Erro de Login:', err);
      let errorMessage = 'Não foi possível conectar ao servidor.';
      if (err.response) {
        // O servidor respondeu com um erro (401, 500)
        errorMessage = err.response.data?.message || 'Credenciais inválidas.';
      } else if (err.request) {
        // A requisição foi feita, mas não houve resposta (back-end offline?)
        errorMessage = 'Servidor não respondeu. O back-end está rodando?';
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="p-6 space-y-5" onSubmit={handleSubmit}>
      <div className="text-center pb-2">
        <h2 className="text-xl font-bold text-gray-700">Login do Sistema</h2>
        <p className="text-sm text-gray-500">Gestão de Estoque</p>
      </div>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Código do Funcionário"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
        />
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
        />
      </div>
      {error && <p className="text-red-500 text-center text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full py-3 text-white font-semibold rounded-lg shadow-md transition duration-200 bg-green-600 hover:bg-green-700 disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? 'Acessando...' : 'Entrar (v2 LIMPO)'}
      </button>
    </form>
  );
}

function LoginContainer({ onLogin }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden">
        <LoginForm onLogin={onLogin} />
      </div>
    </div>
  );
}

// --- COMPONENTE DO CRUD (O APP PRINCIPAL) ---
function GerenciadorDeProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', preco: '' });
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [termoBusca, setTermoBusca] = useState('');

  // 1. READ (Buscar Produtos)
  useEffect(() => {
    const fetchProdutos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/produtos');
        setProdutos(response.data);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        setError('Não foi possível carregar os produtos. Verifique o back-end.');
      } finally {
        setLoading(false);
      }
    };
    fetchProdutos();
  }, []);

  // 2. PESQUISAR (Filtro local)
  const produtosFiltrados = useMemo(() => {
    if (!termoBusca) return produtos;
    return produtos.filter(
      (p) =>
        (p.nome && p.nome.toLowerCase().includes(termoBusca.toLowerCase())) ||
        (p.descricao && p.descricao.toLowerCase().includes(termoBusca.toLowerCase()))
    );
  }, [produtos, termoBusca]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3. CREATE / UPDATE (Cadastrar e Editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const dadosProduto = {
      ...formData,
      preco: parseFloat(formData.preco) || 0,
    };

    if (!dadosProduto.nome || dadosProduto.preco <= 0) {
        setError('Nome e Preço (maior que zero) são obrigatórios.');
        return;
    }
    setError(null);

    try {
      if (produtoEditando) {
        // UPDATE (Editar)
        const response = await api.put(`/produtos/${produtoEditando.id}`, dadosProduto);
        setProdutos(
          produtos.map((p) => (p.id === produtoEditando.id ? response.data : p))
        );
      } else {
        // CREATE (Cadastrar)
        const response = await api.post('/produtos', dadosProduto);
        setProdutos([response.data, ...produtos]);
      }
      cancelarEdicao(); // Limpa o formulário
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      setError(err.response?.data?.error || 'Erro ao salvar produto.');
    }
  };

  // 4. DELETE (Excluir)
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await api.delete(`/produtos/${id}`);
        setProdutos(produtos.filter((p) => p.id !== id));
      } catch (err) {
        console.error('Erro ao excluir produto:', err);
        setError('Erro ao excluir produto.');
      }
    }
  };

  const iniciarEdicao = (produto) => {
    setProdutoEditando(produto);
    setFormData({
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
    });
    window.scrollTo(0, 0);
  };

  const cancelarEdicao = () => {
    setProdutoEditando(null);
    setFormData({ nome: '', descricao: '', preco: '' });
  };

  return (
    <main className="flex flex-col md:flex-row gap-8 p-6 flex-grow max-w-7xl w-full mx-auto">
      {/* --- FORMULÁRIO --- */}
      <div className="w-full md:w-1/3">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 shadow-xl rounded-xl space-y-4"
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            {produtoEditando ? 'Editar Produto' : 'Cadastrar Produto'}
          </h2>
          <input
            type="text" name="nome" placeholder="Nome do Produto"
            value={formData.nome} onChange={handleFormChange} required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            name="descricao" placeholder="Descrição"
            value={formData.descricao} onChange={handleFormChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number" name="preco" placeholder="Preço (ex: 19.99)"
            value={formData.preco} onChange={handleFormChange}
            step="0.01" min="0.01" required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="w-full py-2 text-white font-semibold rounded-lg shadow-md transition duration-200 bg-blue-600 hover:bg-blue-700"
            >
              {produtoEditando ? 'Atualizar' : 'Cadastrar'}
            </button>
            {produtoEditando && (
              <button
                type="button" onClick={cancelarEdicao}
                className="w-full py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg shadow-md transition duration-200"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- LISTA E PESQUISA --- */}
      <div className="w-full md:w-2/3 bg-white p-6 shadow-xl rounded-xl">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          Produtos em Estoque ({produtosFiltrados.length})
        </h2>
        <input
          type="text" placeholder="Pesquisar por nome ou descrição..."
          value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-red-500 text-center py-2">{error}</p>}
        {loading && <p className="text-gray-500 text-center">Carregando produtos...</p>}
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          {!loading && produtosFiltrados.length === 0 ? (
            <p className="text-gray-500 text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
              {termoBusca ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado.'}
            </p>
          ) : (
            produtosFiltrados.map((p) => (
              <div
                key={p.id}
                className="border-l-4 border-blue-500 p-4 bg-gray-50 hover:bg-white rounded-lg shadow transition duration-150"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-bold text-gray-800">{p.nome}</p>
                    <p className="text-sm text-gray-600 mb-1">{p.descricao || 'Sem descrição'}</p>
                  </div>
                  <span className="font-semibold text-blue-600 text-lg">
                    R$ {parseFloat(p.preco).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => iniciarEdicao(p)}
                    className="text-sm bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold py-1 px-3 rounded-lg transition duration-150"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-lg transition duration-150"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

// --- COMPONENTE PRINCIPAL APP ---
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // --- TESTE DE HOTWIRE (Pular Login) ---
  // Descomente a linha abaixo para pular o login e ir direto para o CRUD
  // useEffect(() => { setIsLoggedIn(true); }, []);
  // --- FIM DO TESTE ---

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginContainer onLogin={setIsLoggedIn} />;
  }

  // Layout principal após o login
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4 shadow-lg flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão de Produtos</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150"
        >
          Sair
        </button>
      </header>
      <GerenciadorDeProdutos />
      <footer className="bg-gray-800 text-white p-3 mt-auto shadow-inner">
        <p className="text-center text-sm">
          © {new Date().getFullYear()} Treko-Sistema de Gestão de Estoque.
        </p>
      </footer>
    </div>
  );
}

export default App;