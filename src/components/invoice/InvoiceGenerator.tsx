import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceGeneratorProps {
  orderId: string;
  orderData: any;
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ orderId, orderData }) => {
  
  const generateInvoiceMutation = useMutation({
    mutationFn: async () => {
      // Gerar número da nota fiscal
      const { data: invoiceNumber, error: numberError } = await supabase
        .rpc('generate_invoice_number');
      
      if (numberError) throw numberError;

      // Criar a nota fiscal
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          order_id: orderId,
          invoice_number: invoiceNumber,
          total_amount: orderData.total_amount,
          tax_amount: orderData.total_amount * 0.05, // 5% de taxa exemplo
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;
      
      return invoice;
    },
    onSuccess: (invoice) => {
      toast.success('Nota fiscal gerada com sucesso!');
      downloadInvoicePDF(invoice);
    },
    onError: (error) => {
      console.error('Error generating invoice:', error);
      toast.error(`Erro ao gerar nota fiscal: ${error.message}`);
    },
  });

  const downloadInvoicePDF = (invoice: any) => {
    // Gerar PDF da nota fiscal
    const pdfContent = generateInvoicePDFContent(invoice, orderData);
    
    // Criar blob e download
    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nota-fiscal-${invoice.invoice_number}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateInvoicePDFContent = (invoice: any, order: any) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Nota Fiscal - ${invoice.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .info { display: flex; justify-content: space-between; margin: 20px 0; }
          .items { margin: 20px 0; }
          .total { text-align: right; font-weight: bold; font-size: 18px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>NOTA FISCAL ELETRÔNICA</h1>
          <h2>Pedido Fácil</h2>
          <p>CNPJ: 00.000.000/0001-00</p>
        </div>
        
        <div class="info">
          <div>
            <h3>Dados do Cliente:</h3>
            <p><strong>Pedido:</strong> ${order.id}</p>
            <p><strong>Data:</strong> ${new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
            <p><strong>Endereço:</strong> ${order.delivery_address}</p>
          </div>
          <div>
            <h3>Nota Fiscal:</h3>
            <p><strong>Número:</strong> ${invoice.invoice_number}</p>
            <p><strong>Data Emissão:</strong> ${new Date(invoice.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        
        <div class="items">
          <h3>Itens do Pedido:</h3>
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Valor Unitário</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.order_items?.map((item: any) => `
                <tr>
                  <td>${item.products?.name || 'Produto'}</td>
                  <td>${item.quantity}</td>
                  <td>R$ ${parseFloat(item.unit_price).toFixed(2)}</td>
                  <td>R$ ${parseFloat(item.total_price).toFixed(2)}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
        </div>
        
        <div class="total">
          <p>Subtotal: R$ ${(parseFloat(order.total_amount) - parseFloat(order.delivery_fee || 0)).toFixed(2)}</p>
          <p>Taxa de Entrega: R$ ${parseFloat(order.delivery_fee || 0).toFixed(2)}</p>
          <p>Impostos: R$ ${parseFloat(invoice.tax_amount).toFixed(2)}</p>
          <p><strong>Total Geral: R$ ${parseFloat(invoice.total_amount).toFixed(2)}</strong></p>
        </div>
        
        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
          <p>Esta é uma representação simplificada da nota fiscal eletrônica.</p>
          <p>Emitida via Pedido Fácil em ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <Button
      onClick={() => generateInvoiceMutation.mutate()}
      disabled={generateInvoiceMutation.isPending}
      className="w-full"
    >
      <FileText className="w-4 h-4 mr-2" />
      {generateInvoiceMutation.isPending ? 'Gerando...' : 'Gerar Nota Fiscal'}
    </Button>
  );
};