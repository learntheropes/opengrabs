export const getAttributes = async (page) => {
  try {

  await blockRequests(page, [
    'cloudfront.net',
    'krxd.net',
    'amazon-adsystem.com',
    'google.com'
  ])
  
  let title, price, image
  
  await Promise.all([
    getTitle(page, 3000).then(res => title = res),
    getPrice(page, 3000).then(res => price = parseFloat(res.match(/\d+|\.|\,/g).join('').replace(',','.'))),
    getImage(page, 3000).then(res => image = res)
  ])

  return {
    title,
    price,
    image
  } 

  } catch (error) {
  console.error(error)
  }
}

const getImage = async (page,timeout) => {
  try {
  let promises = []
  
  const selectors = [
    '#imgTagWrapperId > img',
  ]

  const evalFunction = (el) => el.getAttribute('src')

  for (const selector of selectors) {

    const promise = page.waitForSelector(selector, {timeout}).then( async () => {
    return await page.$eval(selector, evalFunction)
    }).catch(() => {
    return null;
    })

    promises.push(promise)
  }
  return await Promise.race(promises)
  } catch (error) {
  console.error('Error at amazon.specification.getImage()', error)
  }
}

const getTitle = async (page,timeout) => {
  try {
  let promises = []
  
  const selectors = [
    '#olpProductDetails > h1',
    'span#productTitle'
  ]

  const evalFunction = (el) => el.innerText

  for (const selector of selectors) {

    const promise = page.waitForSelector(selector, {timeout}).then( async () => {
    return await page.$eval(selector, evalFunction)
    }).catch(() => {
    return null;
    })

    promises.push(promise)
  }
  return await Promise.race(promises)
  } catch (error) {
  console.error('Error at amazon.specification.getTitle()', error)
  }
}

const getPrice = async (page,timeout) => {
  try {
  let promises = []
  
  const selectors = [
    'span.a-price > span.a-offscreen',
  ]

  const evalFunction = (el) => el.innerText

  for (const selector of selectors) {

    const promise = page.waitForSelector(selector, {timeout}).then( async () => {
    return await page.$eval(selector, evalFunction)
    }).catch(() => {
    return null;
    })

    promises.push(promise)
  }
  return await Promise.race(promises)
  } catch (error) {
  console.error('Error at amazon.specification.getPrice()', error)
  }
}

const blockRequests = async (page, urls) => {

  await page.setRequestInterception(true)

  page.on('request', (request) => {
    const url = request.url();
    const shouldAbort = urls.some((urlPart) => url.includes(urlPart))
    if (shouldAbort) request.abort()
    else if (request.resourceType() === ('image' || 'stylesheet' || 'font')) request.abort()
    else request.continue();
  })
}