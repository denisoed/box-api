'use strict';

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap
 */

const { Bot, InlineKeyboard } = require('grammy');

const bot = new Bot(process.env.TELEGRAM_BOT_KEY);

function createWelcomeMessage(ctx) {
  return (
    `Hi <b>${ctx.from.first_name || ''} ${ctx.from.last_name || ''}</b> 👋 \n\n` +
    'Ready for an exciting building adventure?\n\n' +
    'Here you can build incredible towers, earn points and exchange them for valuable coins that can become a real treasure!'
  );
}

function createRoadmapMessage() {
  return (
    '🚧 Roadmap 🚧 \n\n' +
    '<b>1. Launch of the Beta Version</b>\n\n' +
    '- <s>Testing and optimizing the core game mechanics (tower building, point accumulation).</s>\n\n' +
    '- Collecting user feedback to improve the gameplay experience.\n\n' +
    '<b>2. Integration of the In-Game Currency ("BoxCoin")</b>\n\n' +
    '- Introduction of tokens that can be earned in the game.\n\n' +
    '- Establishing the basic economy and wallet system for token storage.\n\n' +
    '<b>3. Preparation for Airdrop and Listing</b>\n\n' +
    '- Development of smart contracts for token distribution.\n\n' +
    '- Creating a marketing plan to attract attention to the upcoming airdrop and listing.\n\n' +
    '<b>4. Airdrop for Early Users and Community Members</b>\n\n' +
    '- Distributing a certain amount of tokens to active players and community members.\n\n' +
    '- Creating a mechanism for participating in the airdrop (registration, task completion, activity).\n\n' +
    '<b>5. Listing Tokens on Cryptocurrency Exchanges</b>\n\n' +
    '- Collaborating with major cryptocurrency exchanges for the listing of "BoxCoin".\n\n' +
    '- Launching a promotional campaign for tokens on the exchange to attract traders and investors.\n\n' +
    '<b>6. Launch of NFT Tokens</b>\n\n' +
    '- Development of smart contracts for NFT distribution.\n\n' +
    '- Introduction of unique collectible NFTs (rare blocks, tools, characters).\n\n' +
    '<b>7. Regular Tournaments with Prizes in Tokens and NFTs</b>\n\n' +
    '- Organizing weekly tournaments with rewards in "BoxCoin" and rare NFTs.\n\n' +
    '<b>8. Introduction of Staking and "Play-to-Earn" Systems</b>\n\n' +
    '- Launching staking functions for tokens and NFTs, allowing users to earn interest.\n\n' +
    '- Implementing the "Play-to-Earn" mechanics, where players earn tokens by participating in the game and completing tasks.\n\n' +
    '<b>9. Airdrop 2.0 to Increase Engagement</b>\n\n' +
    '- A second round of airdrop for new users and long-term players.'
  );
}

const keyboard = new InlineKeyboard()
  .webApp('🚀 Start Game', 'https://get-info-about.me/')
  .row()
  .url('👥 Join the community', 'https://t.me/box_stacker_community')
  .row()
  .text('🚧 Roadmap', 'roadmap')

module.exports = () => {
  bot.on('pre_checkout_query', (ctx) => {
    return ctx.answerPreCheckoutQuery(true).catch((err) => {
      console.error('answerPreCheckoutQuery failed: ', err);
    });
  });
  
  // Create invoice
  bot.on('message:successful_payment', async (ctx) => {
    if (!ctx.message || !ctx.message.successful_payment || !ctx.from) {
      return;
    }
    try {
      await strapi.query('invoices').create({
        tgUserId: ctx.from.id,
        tgInvoiceId: ctx.message.successful_payment.telegram_payment_charge_id
      });
    } catch (error) {
      console.error(error);
    }
  });

  bot.command('start', (ctx) => {
    ctx.reply(
      createWelcomeMessage(ctx),
      {
        reply_markup: keyboard,
        parse_mode: 'HTML'
      }
    );
  });

  bot.callbackQuery('roadmap', (ctx) => {
    ctx.reply(
      createRoadmapMessage(),
      {
        parse_mode: 'HTML'
      }
    );
  });

  bot.start();

  console.log('Bot start successfully');

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
};
