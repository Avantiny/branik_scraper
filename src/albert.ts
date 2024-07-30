import puppeteer from "puppeteer";

const url = "https://www.albert.cz/";

const browser = await puppeteer.launch();
const page = await browser.newPage();

export const albert = async () => {
  await page.goto(url);
  await page.setViewport({ width: 1080, height: 1024 });
  await page.locator("button[data-testid=cookie-popup-accept]").click();

  console.log("Cookies accepted");

  await page.locator("input[aria-label=Hledat]").click();

  console.log("Search bar clicked");

  await page.keyboard.type("braník");

  console.log("Braník typed");

  await page.locator("button[data-testid=header-search-submit]").click();

  console.log("Search button clicked");

  await page.waitForSelector('div[data-testid="search-results-list-wrapper"]');

  const productNames = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll('[data-testid="product-block-product-name"] a')
    ).map((el) => el.textContent?.trim());
  });

  console.log("Products found on the page:", productNames);

  const productSelector = 'a[aria-label="Braník světlý dvoulitr"]';
  await page.waitForSelector(productSelector, { timeout: 5000 }).catch(() => {
    console.error("Product not found: Braník světlý dvoulitr");
  });

  const productExists = (await page.$(productSelector)) !== null;
  if (!productExists) {
    console.error("Product not found");
    await browser.close();
    process.exit(1);
  }

  const price = await page.evaluate((productSelector) => {
    const product = document
      .querySelector(productSelector)
      ?.closest(".product-item");
    if (!product) return null;

    const priceIntegerElement = product.querySelector(
      '[data-testid="product-block-price"] .sc-dqia0p-9'
    );
    const priceDecimalElement = product.querySelector(
      '[data-testid="product-block-price"] .sc-dqia0p-10'
    );
    const currencyElement = product.querySelector(
      '[data-testid="product-block-price"] .sc-dqia0p-8:last-of-type'
    );

    if (!priceIntegerElement || !priceDecimalElement || !currencyElement)
      return null;

    const priceInteger = priceIntegerElement.textContent?.trim();
    const priceDecimal = priceDecimalElement.textContent?.trim();
    const currency = currencyElement.textContent?.trim();

    const formattedPrice = `${priceInteger}.${priceDecimal} ${currency}`;
    console.log(`Price of "Braník světlý dvoulitr": ${price}`);
    return `${priceInteger}.${priceDecimal}`;
  }, productSelector);

  await page.screenshot({ path: "albert-branik.png" });
  await page.screenshot({ path: "albert.png" });

  await page.close();
  await browser.close();

  return price;
};
