import { useState } from "react";
import { apiFetch } from "../api";


function ProductForm({ onSave, initialValues = null, submitToServer = false }) {
    const [form, setForm] = useState(initialValues || {
        nome: "",
        codigo: "",
        quantidade: 0,
        preco: 0,
        categoria: "",
    });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const baseProduct = {
            ...form,
            valor: Number(form.preco) || 0,
            estoque: Number(form.quantidade) || 0,
            descricao: String(form.nome || "") + " " + String(form.categoria || ""),
            dataEntrada: new Date().toLocaleDateString('pt-BR'),
        };

        let productToAdd = { ...baseProduct, id: Math.random().toString(36).substring(2, 9).toUpperCase() };

        if (submitToServer) {
            try {
                const created = await apiFetch('/api/products', { method: 'POST', body: baseProduct });
                if (created && created.id) productToAdd = created;
            } catch (err) {
                console.error('Falha ao enviar produto ao servidor:', err);
            }
        }

        onSave(productToAdd);
        setForm({ nome: "", codigo: "", quantidade: 0, preco: 0, categoria: "" });
    };

  return (
    <form 
        onSubmit={handleSubmit} 
        className="p-6 bg-white shadow-lg rounded-xl w-full max-w-md mx-auto space-y-4 border border-gray-100"
    >
        <h2 className="text-2xl font-semibold text-center text-gray-700">Adicionar Novo Produto</h2>

        {/* Nome */}
        <div className="space-y-1">
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome do Produto</label>
            <input
                id="nome"
                name="nome"
                type="text"
                value={form.nome}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
        
        {/* Código */}
        <div className="space-y-1">
            <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">Código</label>
            <input
                id="codigo"
                name="codigo"
                type="text"
                value={form.codigo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
        </div>

        {/* Quantidade e Preço em uma linha */}
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700">Estoque</label>
                <input
                    id="quantidade"
                    name="quantidade"
                    type="number"
                    value={form.quantidade}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div className="space-y-1">
                <label htmlFor="preco" className="block text-sm font-medium text-gray-700">Preço (R$)</label>
                <input
                    id="preco"
                    name="preco"
                    type="number"
                    value={form.preco}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
        </div>

        {/* Categoria */}
        <div className="space-y-1">
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">Categoria</label>
            <select
                id="categoria"
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
                <option value="">Selecione...</option>
                <option value="Eletronicos">Eletrônicos</option>
                <option value="Vestuario">Vestuário</option>
                <option value="Alimentos">Alimentos</option>
                <option value="Limpeza">Limpeza</option>
            </select>
        </div>

        <button 
            type="submit" 
            className="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
        >
            Salvar Produto
        </button>
    </form>
  );

}

export default ProductForm;
