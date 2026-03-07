import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Gather data for the past 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weekStr = oneWeekAgo.toISOString();

    const [orders, automations, tickets, settings] = await Promise.all([
      base44.asServiceRole.entities.Order.list('-created_date', 200),
      base44.asServiceRole.entities.Automation.list(),
      base44.asServiceRole.entities.SupportTicket.list('-created_date', 200),
      base44.asServiceRole.entities.AppSettings.list(),
    ]);

    const weekOrders = orders.filter(o => o.created_date >= weekStr);
    const weekTickets = tickets.filter(t => t.created_date >= weekStr);
    const weekRevenue = weekOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const activeAutomations = automations.filter(a => a.status === 'active').length;
    const totalRuns = automations.reduce((sum, a) => sum + (a.run_count || 0), 0);

    // Get business email from settings
    const emailSetting = settings.find(s => s.setting_key === 'shop');
    let businessEmail = user.email;
    try {
      const shopData = emailSetting ? JSON.parse(emailSetting.setting_value) : null;
      if (shopData?.shop_email) businessEmail = shopData.shop_email;
    } catch {}

    const reportHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #f59e0b; font-size: 24px; margin: 0;">📊 Raporti Javor</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 8px;">SmileHub Platform — ${new Date().toLocaleDateString('sq-AL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div style="display: grid; gap: 16px; margin-bottom: 32px;">
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px;">
            <h2 style="color: #10b981; font-size: 16px; margin: 0 0 12px 0;">🛍️ Shitjet Javore</h2>
            <p style="font-size: 28px; font-weight: bold; color: #10b981; margin: 0;">ALL ${weekRevenue.toLocaleString()}</p>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">${weekOrders.length} porosi të reja këtë javë</p>
          </div>

          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px;">
            <h2 style="color: #f59e0b; font-size: 16px; margin: 0 0 12px 0;">⚡ Automatizime</h2>
            <p style="font-size: 28px; font-weight: bold; color: #f59e0b; margin: 0;">${activeAutomations} aktive</p>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">${totalRuns} ekzekutime gjithsej</p>
          </div>

          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px;">
            <h2 style="color: #38bdf8; font-size: 16px; margin: 0 0 12px 0;">🎧 Suport</h2>
            <p style="font-size: 28px; font-weight: bold; color: #38bdf8; margin: 0;">${weekTickets.length} tiketa</p>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">${weekTickets.filter(t => t.status === 'resolved').length} të zgjidhura, ${weekTickets.filter(t => t.status === 'open').length} të hapura</p>
          </div>
        </div>

        <div style="text-align: center; color: #475569; font-size: 12px; border-top: 1px solid #1e293b; padding-top: 20px;">
          SmileHub Platform • Raport automatik javor
        </div>
      </div>
    `;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: businessEmail,
      subject: `📊 Raporti Javor SmileHub — ${new Date().toLocaleDateString('sq-AL')}`,
      body: reportHtml,
    });

    return Response.json({
      success: true,
      sent_to: businessEmail,
      stats: {
        orders: weekOrders.length,
        revenue: weekRevenue,
        tickets: weekTickets.length,
        automations: activeAutomations,
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});