<template>
  <div class="categories-page">
    <!-- Hero Section -->
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <h1 class="page-header__title">Campaign Categories</h1>
          <p class="page-header__description">
            Explore campaigns organized by category. From personal fitness goals to environmental
            initiatives, find causes that matter to you.
          </p>
        </div>
      </div>
    </header>

    <!-- Categories Grid -->
    <main class="categories-content">
      <div class="container-app">
        <!-- Featured Categories -->
        <section class="category-group">
          <h2 class="category-group__title">
            <Icon name="heroicons:star" />
            Featured Categories
          </h2>
          <div class="categories-grid">
            <NuxtLink
              v-for="category in featuredCategories"
              :key="category.id"
              :to="`/campaigns?category=${category.id}`"
              class="category-card category-card--featured"
            >
              <div class="category-card__icon">
                <Icon :name="category.icon" />
              </div>
              <div class="category-card__content">
                <h3>{{ category.name }}</h3>
                <p>{{ category.description }}</p>
              </div>
              <Icon
                name="heroicons:chevron-right"
                class="category-card__arrow"
              />
            </NuxtLink>
          </div>
        </section>

        <!-- Personal & Individual Growth -->
        <section class="category-group">
          <h2 class="category-group__title">
            <Icon name="heroicons:user" />
            Personal & Individual Growth
          </h2>
          <div class="categories-grid categories-grid--compact">
            <NuxtLink
              v-for="category in personalCategories"
              :key="category.id"
              :to="`/campaigns?category=${category.id}`"
              class="category-card"
            >
              <div class="category-card__icon category-card__icon--small">
                <Icon :name="category.icon" />
              </div>
              <div class="category-card__content">
                <h3>{{ category.name }}</h3>
                <p>{{ category.description }}</p>
              </div>
            </NuxtLink>
          </div>
        </section>

        <!-- Business & Entrepreneurship -->
        <section class="category-group">
          <h2 class="category-group__title">
            <Icon name="heroicons:building-office" />
            Business & Entrepreneurship
          </h2>
          <div class="categories-grid categories-grid--compact">
            <NuxtLink
              v-for="category in businessCategories"
              :key="category.id"
              :to="`/campaigns?category=${category.id}`"
              class="category-card"
            >
              <div class="category-card__icon category-card__icon--small">
                <Icon :name="category.icon" />
              </div>
              <div class="category-card__content">
                <h3>{{ category.name }}</h3>
                <p>{{ category.description }}</p>
              </div>
            </NuxtLink>
          </div>
        </section>

        <!-- Nonprofit & Humanitarian -->
        <section class="category-group">
          <h2 class="category-group__title">
            <Icon name="heroicons:heart" />
            Nonprofit & Humanitarian
          </h2>
          <div class="categories-grid categories-grid--compact">
            <NuxtLink
              v-for="category in nonprofitCategories"
              :key="category.id"
              :to="`/campaigns?category=${category.id}`"
              class="category-card"
            >
              <div class="category-card__icon category-card__icon--small">
                <Icon :name="category.icon" />
              </div>
              <div class="category-card__content">
                <h3>{{ category.name }}</h3>
                <p>{{ category.description }}</p>
              </div>
            </NuxtLink>
          </div>
        </section>

        <!-- Environmental -->
        <section class="category-group">
          <h2 class="category-group__title">
            <Icon name="heroicons:globe-americas" />
            Environmental
          </h2>
          <div class="categories-grid categories-grid--compact">
            <NuxtLink
              v-for="category in environmentalCategories"
              :key="category.id"
              :to="`/campaigns?category=${category.id}`"
              class="category-card"
            >
              <div class="category-card__icon category-card__icon--small">
                <Icon :name="category.icon" />
              </div>
              <div class="category-card__content">
                <h3>{{ category.name }}</h3>
                <p>{{ category.description }}</p>
              </div>
            </NuxtLink>
          </div>
        </section>

        <!-- Community & Civic -->
        <section class="category-group">
          <h2 class="category-group__title">
            <Icon name="heroicons:user-group" />
            Community & Civic
          </h2>
          <div class="categories-grid categories-grid--compact">
            <NuxtLink
              v-for="category in communityCategories"
              :key="category.id"
              :to="`/campaigns?category=${category.id}`"
              class="category-card"
            >
              <div class="category-card__icon category-card__icon--small">
                <Icon :name="category.icon" />
              </div>
              <div class="category-card__content">
                <h3>{{ category.name }}</h3>
                <p>{{ category.description }}</p>
              </div>
            </NuxtLink>
          </div>
        </section>

        <!-- Education -->
        <section class="category-group">
          <h2 class="category-group__title">
            <Icon name="heroicons:academic-cap" />
            Education
          </h2>
          <div class="categories-grid categories-grid--compact">
            <NuxtLink
              v-for="category in educationCategories"
              :key="category.id"
              :to="`/campaigns?category=${category.id}`"
              class="category-card"
            >
              <div class="category-card__icon category-card__icon--small">
                <Icon :name="category.icon" />
              </div>
              <div class="category-card__content">
                <h3>{{ category.name }}</h3>
                <p>{{ category.description }}</p>
              </div>
            </NuxtLink>
          </div>
        </section>

        <!-- Arts & Science -->
        <section class="category-group">
          <h2 class="category-group__title">
            <Icon name="heroicons:beaker" />
            Arts & Science
          </h2>
          <div class="categories-grid categories-grid--compact">
            <NuxtLink
              v-for="category in artsScienceCategories"
              :key="category.id"
              :to="`/campaigns?category=${category.id}`"
              class="category-card"
            >
              <div class="category-card__icon category-card__icon--small">
                <Icon :name="category.icon" />
              </div>
              <div class="category-card__content">
                <h3>{{ category.name }}</h3>
                <p>{{ category.description }}</p>
              </div>
            </NuxtLink>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
interface Category {
  id: string
  name: string
  description: string
  icon: string
}

const featuredCategories: Category[] = [
  {
    id: 'personal-fitness',
    name: 'Personal Fitness',
    description: 'Health and fitness improvement goals',
    icon: 'heroicons:heart',
  },
  {
    id: 'startup-launch',
    name: 'Startup Launch',
    description: 'New business and startup launch milestones',
    icon: 'heroicons:rocket-launch',
  },
  {
    id: 'nonprofit-fundraising',
    name: 'Nonprofit Fundraising',
    description: 'Charitable organization fundraising campaigns',
    icon: 'heroicons:gift',
  },
  {
    id: 'tree-planting',
    name: 'Tree Planting',
    description: 'Reforestation and urban greening initiatives',
    icon: 'heroicons:sparkles',
  },
  {
    id: 'education-funding',
    name: 'Education Funding',
    description: 'Scholarships and educational resources',
    icon: 'heroicons:academic-cap',
  },
  {
    id: 'scientific-research',
    name: 'Scientific Research',
    description: 'Research projects and scientific discovery',
    icon: 'heroicons:beaker',
  },
]

const personalCategories: Category[] = [
  {
    id: 'personal-fitness',
    name: 'Personal Fitness',
    description: 'Health and fitness goals',
    icon: 'heroicons:heart',
  },
  {
    id: 'weight-loss',
    name: 'Weight Loss',
    description: 'Weight management goals',
    icon: 'heroicons:scale',
  },
  {
    id: 'endurance-sports',
    name: 'Endurance Sports',
    description: 'Marathon, triathlon challenges',
    icon: 'heroicons:bolt',
  },
  {
    id: 'academic-success',
    name: 'Academic Success',
    description: 'Educational achievements',
    icon: 'heroicons:academic-cap',
  },
  {
    id: 'skill-building',
    name: 'Skill Building',
    description: 'Professional skill development',
    icon: 'heroicons:puzzle-piece',
  },
  {
    id: 'career-growth',
    name: 'Career Growth',
    description: 'Professional advancement',
    icon: 'heroicons:arrow-trending-up',
  },
  {
    id: 'health-recovery',
    name: 'Health Recovery',
    description: 'Medical recovery goals',
    icon: 'heroicons:plus',
  },
  {
    id: 'debt-payoff',
    name: 'Debt Payoff',
    description: 'Financial freedom goals',
    icon: 'heroicons:banknotes',
  },
  {
    id: 'sustainable-living',
    name: 'Sustainable Living',
    description: 'Eco-friendly lifestyle pledges',
    icon: 'heroicons:leaf',
  },
]

const businessCategories: Category[] = [
  {
    id: 'startup-launch',
    name: 'Startup Launch',
    description: 'New business milestones',
    icon: 'heroicons:rocket-launch',
  },
  {
    id: 'sales-targets',
    name: 'Sales Targets',
    description: 'Sales performance targets',
    icon: 'heroicons:chart-bar',
  },
  {
    id: 'revenue-growth',
    name: 'Revenue Growth',
    description: 'Business growth objectives',
    icon: 'heroicons:currency-dollar',
  },
]

const nonprofitCategories: Category[] = [
  {
    id: 'nonprofit-fundraising',
    name: 'Nonprofit Fundraising',
    description: 'Charitable campaigns',
    icon: 'heroicons:gift',
  },
  {
    id: 'shelter-housing',
    name: 'Shelter & Housing',
    description: 'Housing assistance',
    icon: 'heroicons:home',
  },
  {
    id: 'food-security',
    name: 'Food Security',
    description: 'Hunger relief initiatives',
    icon: 'heroicons:cake',
  },
  {
    id: 'homelessness-reduction',
    name: 'Homelessness Reduction',
    description: 'Housing programs',
    icon: 'heroicons:hand-raised',
  },
  {
    id: 'mental-health-support',
    name: 'Mental Health Support',
    description: 'Mental health services',
    icon: 'heroicons:face-smile',
  },
  {
    id: 'animal-rescue',
    name: 'Animal Rescue',
    description: 'Animal welfare operations',
    icon: 'heroicons:heart',
  },
]

const environmentalCategories: Category[] = [
  {
    id: 'environmental-cleanup',
    name: 'Environmental Cleanup',
    description: 'Pollution cleanup',
    icon: 'heroicons:trash',
  },
  {
    id: 'tree-planting',
    name: 'Tree Planting',
    description: 'Reforestation initiatives',
    icon: 'heroicons:sparkles',
  },
  {
    id: 'carbon-reduction',
    name: 'Carbon Reduction',
    description: 'Emissions reduction',
    icon: 'heroicons:cloud',
  },
  {
    id: 'renewable-energy',
    name: 'Renewable Energy',
    description: 'Clean energy projects',
    icon: 'heroicons:sun',
  },
]

const communityCategories: Category[] = [
  {
    id: 'crime-reduction',
    name: 'Crime Reduction',
    description: 'Public safety initiatives',
    icon: 'heroicons:shield-check',
  },
  {
    id: 'traffic-safety',
    name: 'Traffic Safety',
    description: 'Road safety programs',
    icon: 'heroicons:truck',
  },
  {
    id: 'community-projects',
    name: 'Community Projects',
    description: 'Local improvement',
    icon: 'heroicons:user-group',
  },
  {
    id: 'civic-engagement',
    name: 'Civic Engagement',
    description: 'Voter participation',
    icon: 'heroicons:hand-raised',
  },
]

const educationCategories: Category[] = [
  {
    id: 'education-funding',
    name: 'Education Funding',
    description: 'Scholarships and resources',
    icon: 'heroicons:academic-cap',
  },
  {
    id: 'student-attendance',
    name: 'Student Attendance',
    description: 'Attendance improvement',
    icon: 'heroicons:clipboard-document-check',
  },
  {
    id: 'academic-performance',
    name: 'Academic Performance',
    description: 'Student achievement',
    icon: 'heroicons:trophy',
  },
]

const artsScienceCategories: Category[] = [
  {
    id: 'arts-creativity',
    name: 'Arts & Creativity',
    description: 'Artistic projects',
    icon: 'heroicons:paint-brush',
  },
  {
    id: 'scientific-research',
    name: 'Scientific Research',
    description: 'Research projects',
    icon: 'heroicons:beaker',
  },
]

useSeoMeta({
  title: 'Categories | Pledgebook',
  description:
    'Browse campaign categories on Pledgebook. Find fundraising campaigns for personal fitness, startups, nonprofits, environmental causes, and more.',
})
</script>

<style scoped>
.categories-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.page-header {
  padding: 4rem 0 2rem;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
}

.page-header__content {
  max-width: 600px;
}

.page-header__title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.page-header__description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.categories-content {
  padding: 2rem 0 4rem;
}

.category-group {
  margin-bottom: 3rem;
}

.category-group__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.25rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.categories-grid--compact {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.category-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.category-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.category-card--featured {
  padding: 1.25rem;
}

.category-card__icon {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 0.75rem;
  font-size: 1.25rem;
}

.category-card__icon--small {
  width: 2.5rem;
  height: 2.5rem;
  font-size: 1rem;
}

.category-card__content {
  flex: 1;
  min-width: 0;
}

.category-card__content h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.category-card__content p {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-card__arrow {
  flex-shrink: 0;
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
}

.category-card:hover .category-card__arrow {
  transform: translateX(4px);
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .page-header {
    padding: 2rem 0 1.5rem;
  }

  .page-header__title {
    font-size: 1.75rem;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .category-group {
    margin-bottom: 2rem;
  }
}
</style>
