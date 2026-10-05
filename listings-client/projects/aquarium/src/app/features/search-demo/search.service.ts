import { Injectable } from '@angular/core';

export interface SearchItem {
  id: number;
  title: string;
  category: string;
  description: string;
  tags: string[];
  emoji: string;
  habitat: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private mockData: SearchItem[] = [
    {
      id: 1,
      title: 'Clownfish',
      category: 'Tropical',
      description: 'Colorful fish known for living in sea anemones',
      tags: ['orange', 'white', 'symbiotic', 'reef'],
      emoji: '🐠',
      habitat: 'Coral reefs in warm oceans'
    },
    {
      id: 2,
      title: 'Blue Tang',
      category: 'Tropical',
      description: 'Beautiful blue fish from Finding Nemo',
      tags: ['blue', 'surgeonfish', 'reef', 'ocean'],
      emoji: '🐟',
      habitat: 'Coral reefs in Pacific Ocean'
    },
    {
      id: 3,
      title: 'Goldfish',
      category: 'Freshwater',
      description: 'Popular aquarium fish with flowing fins',
      tags: ['gold', 'orange', 'pond', 'bowl'],
      emoji: '🐠',
      habitat: 'Ponds and freshwater aquariums'
    },
    {
      id: 4,
      title: 'Angelfish',
      category: 'Tropical',
      description: 'Elegant fish with tall dorsal fin',
      tags: ['freshwater', 'marine', 'elegant', 'peaceful'],
      emoji: '🐟',
      habitat: 'Amazon River and coral reefs'
    },
    {
      id: 5,
      title: 'Betta Fish',
      category: 'Freshwater',
      description: 'Fighting fish with vibrant colors',
      tags: ['fighting', 'labyrinth', 'colorful', 'aggressive'],
      emoji: '🐠',
      habitat: 'Rice paddies in Southeast Asia'
    },
    {
      id: 6,
      title: 'Discus Fish',
      category: 'Freshwater',
      description: 'Round-shaped cichlid with beautiful patterns',
      tags: ['cichlid', 'round', 'amazon', 'peaceful'],
      emoji: '🐟',
      habitat: 'Amazon River basin'
    },
    {
      id: 7,
      title: 'Pufferfish',
      category: 'Marine',
      description: 'Inflatable fish that puffs up when threatened',
      tags: ['puffer', 'toxic', 'round', 'defense'],
      emoji: '🐡',
      habitat: 'Tropical and subtropical oceans'
    },
    {
      id: 8,
      title: 'Koi Carp',
      category: 'Freshwater',
      description: 'Large ornamental fish from Japan',
      tags: ['japanese', 'ornamental', 'pond', 'colorful'],
      emoji: '🐠',
      habitat: 'Ponds and large aquariums'
    },
    {
      id: 9,
      title: 'Guppy',
      category: 'Freshwater',
      description: 'Small livebearer fish with colorful tails',
      tags: ['livebearer', 'small', 'colorful', 'easy'],
      emoji: '🐟',
      habitat: 'Freshwater streams in South America'
    },
    {
      id: 10,
      title: 'Neon Tetra',
      category: 'Freshwater',
      description: 'Tiny fish with bright blue and red stripes',
      tags: ['schooling', 'bright', 'small', 'peaceful'],
      emoji: '🐠',
      habitat: 'Amazon River tributaries'
    },
    {
      id: 11,
      title: 'Oscar Fish',
      category: 'Freshwater',
      description: 'Large aggressive cichlid fish',
      tags: ['cichlid', 'large', 'aggressive', 'predator'],
      emoji: '🐟',
      habitat: 'Amazon River basin'
    },
    {
      id: 12,
      title: 'Zebrafish',
      category: 'Freshwater',
      description: 'Striped fish used in scientific research',
      tags: ['striped', 'research', 'schooling', 'model'],
      emoji: '🐠',
      habitat: 'Rivers and streams in India'
    }
  ];

  constructor() { }

  searchByName(query: string): SearchItem[] {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    return this.mockData.filter(item =>
      item.title.toLowerCase().includes(searchTerm)
    );
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Tropical': '#ff6b6b',
      'Freshwater': '#4ecdc4',
      'Marine': '#45b7d1',
      'Saltwater': '#96ceb4',
      'Coldwater': '#ffeaa7',
      'Brackish': '#dda0dd'
    };
    return colors[category] || '#a8a8a8';
  }
}
