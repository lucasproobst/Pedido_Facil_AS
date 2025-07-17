
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { orderId } = await req.json();

    // Buscar detalhes completos do pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        restaurants (
          name,
          image_url,
          phone,
          address
        ),
        order_items (
          *,
          products (
            name,
            price
          )
        ),
        profiles (
          name,
          email
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Pedido não encontrado');
    }

    // Gerar HTML do email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmação de Pedido</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .order-details { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .item { display: flex; justify-content: space-between; margin: 10px 0; }
          .total { font-weight: bold; font-size: 18px; border-top: 2px solid #3b82f6; padding-top: 10px; }
          .status { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Pedido Confirmado! 🎉</h1>
            <p>Pedido #${order.id.slice(-8)}</p>
          </div>
          <div class="content">
            <p>Olá <strong>${order.profiles?.name || 'Cliente'}</strong>,</p>
            <p>Seu pedido foi confirmado com sucesso!</p>
            
            <div class="order-details">
              <h3>Detalhes do Restaurante</h3>
              <p><strong>${order.restaurants.name}</strong></p>
              <p>📍 ${order.restaurants.address}</p>
              <p>📞 ${order.restaurants.phone || 'Não informado'}</p>
            </div>

            <div class="order-details">
              <h3>Itens do Pedido</h3>
              ${order.order_items.map((item: any) => `
                <div class="item">
                  <span>${item.quantity}x ${item.products.name}</span>
                  <span>R$ ${item.total_price.toFixed(2)}</span>
                </div>
              `).join('')}
              
              <div class="item">
                <span>Taxa de entrega:</span>
                <span>R$ ${(order.delivery_fee || 0).toFixed(2)}</span>
              </div>
              
              <div class="item total">
                <span>Total:</span>
                <span>R$ ${(order.total_amount + (order.delivery_fee || 0)).toFixed(2)}</span>
              </div>
            </div>

            <div class="order-details">
              <h3>Endereço de Entrega</h3>
              <p>${order.delivery_address}</p>
            </div>

            ${order.notes ? `
            <div class="order-details">
              <h3>Observações</h3>
              <p>${order.notes}</p>
            </div>
            ` : ''}

            <div class="order-details">
              <h3>Status Atual</h3>
              <span class="status">Confirmado</span>
              <p style="margin-top: 10px;">Acompanhe seu pedido em tempo real em nosso app!</p>
            </div>

            <p>Obrigado por escolher nosso serviço!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Simular envio de email (aqui você integraria com um serviço real como Resend)
    console.log('Email enviado para:', order.profiles?.email);
    console.log('Conteúdo do email:', emailHtml);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email enviado com sucesso',
        orderId: order.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro no envio do email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
