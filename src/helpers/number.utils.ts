const getFairPrice = (priceA, priceB) => {
  return Math.min(priceA || priceB, priceB || priceA);
};

export { getFairPrice };
