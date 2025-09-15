import axios from 'axios';
import { useEffect, useState } from 'react';
import { useContentStore } from '../store/content.store';
import { useAuthStore } from '../store/auth.store';

export const useGetTrendingContent = () => {
  const [trendingContent, setTrendingContent] = useState(null);
  const { contentType } = useContentStore();
  const { token } = useAuthStore(); // on récupère le token si dispo

  useEffect(() => {
    const getTrendingContent = async () => {
      try {
        const res = await axios.get(`/api/v1/${contentType}/trending`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {} // facultatif
        });
        setTrendingContent(res.data.content);
      } catch (err) {
        console.error("Erreur lors du chargement du contenu trending", err);
      }
    };

    getTrendingContent();
  }, [contentType, token]);

  return { trendingContent };
};

export default useGetTrendingContent;
