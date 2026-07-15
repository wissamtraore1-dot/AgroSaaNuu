// ============================================================
// AgroSaaNuu — Public Routes
// src/routes/PublicRoutes.jsx
// ============================================================
import React from 'react';
import { Route } from 'react-router-dom';
import PublicLayout  from '../Components/layout/PublicLayout';

import Home          from '../pages/public/Home';
import Products      from '../pages/public/Products';
import ProductDetail from '../pages/public/ProductDetail';
import Transporters  from '../pages/public/Transporters';
import News          from '../pages/public/News';
import NewsDetail    from '../pages/public/NewsDetail';
import MarketPrices  from '../pages/public/MarketPrices';
import Help          from '../pages/public/Help';
import Contact       from '../pages/public/Contact';

const PublicRoutes = () => (
    <>
      <Route element={<PublicLayout />}>
    <Route path="/"              element={<Home />} />
    <Route path="/products"      element={<Products />} />
    <Route path="/products/:id"  element={<ProductDetail />} />
    <Route path="/transporters"  element={<Transporters />} />
    <Route path="/news"          element={<News />} />
    <Route path="/news/:id"      element={<NewsDetail />} />
    <Route path="/market-prices" element={<MarketPrices />} />
    <Route path="/help"          element={<Help />} />
    <Route path="/contact"       element={<Contact />} />
    </Route>
  </>
);

export default PublicRoutes;