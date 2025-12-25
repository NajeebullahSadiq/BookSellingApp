import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { recommendationAPI } from '../utils/api';
import RecommendedProducts from '../components/common/RecommendedProducts';

const Home = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [recommendations, setRecommendations] = useState({ forYou: [], trending: [], popular: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [isAuthenticated]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const requests = [
        recommendationAPI.getTrending({ limit: 6 }),
        recommendationAPI.getPopular({ limit: 6 })
      ];

      if (isAuthenticated) {
        requests.push(recommendationAPI.getForYou({ limit: 6 }));
      }

      const responses = await Promise.all(requests);

      setRecommendations({
        trending: responses[0].data.data,
        popular: responses[1].data.data,
        forYou: isAuthenticated ? responses[2].data.data : []
      });
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Buy & Sell Study Materials</h1>
          <p className="text-xl mb-8">The best marketplace for books, notes, assignments, and projects</p>
          <div className="flex justify-center space-x-4">
            <Link to="/products" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Browse Products
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
                Become a Seller
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Personalized Recommendations */}
      {isAuthenticated && recommendations.forYou.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RecommendedProducts 
              products={recommendations.forYou} 
              title="Recommended for You" 
              loading={loading}
            />
          </div>
        </section>
      )}

      {/* Trending Products */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RecommendedProducts 
            products={recommendations.trending} 
            title="🔥 Trending Now" 
            loading={loading}
          />
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RecommendedProducts 
            products={recommendations.popular} 
            title="⭐ Most Popular" 
            loading={loading}
          />
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose BookMarket?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
              <p className="text-gray-600">Access thousands of books, notes, and assignments from various subjects</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">Safe and secure transactions powered by Stripe</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-2">Quality Content</h3>
              <p className="text-gray-600">All products are verified by our admin team</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">Join thousands of students and professionals</p>
          <Link to="/products" className="btn-primary text-lg px-8 py-3">
            Explore Marketplace
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
