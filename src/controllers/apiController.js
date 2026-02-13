i<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title><%= title %></title>
  <link href="/css/styles.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
</head>

<body class="bg-white text-gray-900">
<div class="max-w-3xl mx-auto py-16 px-6">

  <h1 class="text-4xl font-semibold mb-6 tracking-tight">Post a new ad</h1>
  <p class="text-lg text-gray-600 mb-10">Follow the steps to choose your location and category.</p>

  <!-- STEP 1 -->
  <div id="step1" x-data="locationStep()">
    <h2 class="text-2xl font-medium mb-6">Choose your location</h2>

    <!-- Country -->
    <label class="block mb-2 text-gray-700 font-medium">Country</label>
    <select x-model="selectedCountry" @change="loadCities()"
            class="w-full p-3 border rounded-lg bg-white mb-2 text-black">
      <option value="">Select a country</option>
      <template x-for="c in countries" :key="c.code">
        <option :value="c.code" x-text="c.code.toUpperCase()"></option>
      </template>
    </select>
    <div class="text-sm text-gray-500 mb-6" x-text="debug"></div>

    <!-- City -->
    <label class="block mb-2 text-gray-700 font-medium">City</label>
    <select x-model="selectedCity" :disabled="cities.length === 0"
            class="w-full p-3 border rounded-lg bg-white mb-2 text-black">
      <option value="">Select a city</option>
      <template x-for="city in cities" :key="city.slug">
        <option :value="city.slug" x-text="city.name"></option>
      </template>
    </select>
    <div class="text-sm text-gray-500 mb-6" x-text="debugCities"></div>

    <button onclick="nextStep()" class="w-full bg-pink-600 hover:bg-pink-500 text-white py-3 rounded-lg text-lg font-medium">
      Continue →
    </button>
  </div>

  <!-- STEP 2 -->
  <div id="step2" x-data="categoryStep()" style="display:none;">
    <h2 class="text-2xl font-medium mb-6">Choose a category</h2>

    <!-- Category -->
    <label class="block mb-2 text-gray-700 font-medium">Category</label>
    <select x-model="selectedCategory" @change="loadSubcategories()"
            class="w-full p-3 border rounded-lg bg-white mb-2 text-black">
      <option value="">Select a category</option>
      <template x-for="cat in categories" :key="cat.id">
        <option :value="cat" x-text="cat.name"></option>
      </template>
    </select>
    <div class="text-sm text-gray-500 mb-6" x-text="debug"></div>

    <!-- Subcategory -->
    <label class="block mb-2 text-gray-700 font-medium">Subcategory</label>
    <select x-model="selectedSubcategory" :disabled="subcategories.length === 0"
            class="w-full p-3 border rounded-lg bg-white mb-2 text-black">
      <option value="">Select a subcategory</option>
      <template x-for="sub in subcategories" :key="sub.id">
        <option :value="sub" x-text="sub.name"></option>
      </template>
    </select>
    <div class="text-sm text-gray-500 mb-6" x-text="debugSub"></div>

    <div class="flex justify-between mt-6">
      <button onclick="prevStep()" class="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg">← Back</button>
      <button onclick="nextStep()" class="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-lg">Continue →</button>
    </div>
  </div>

  <!-- STEP 3 -->
  <div id="step3" x-data="summaryStep()" style="display:none;">
    <h2 class="text-2xl font-medium mb-6">Ready to create your ad?</h2>

    <ul class="mb-8 text-gray-800">
      <li><strong>Country:</strong> <span x-text="country"></span></li>
      <li><strong>City:</strong> <span x-text="city"></span></li>
      <li><strong>Category:</strong> <span x-text="categorySlug"></span></li>
      <li><strong>Subcategory:</strong> <span x-text="subcategorySlug"></span></li>
    </ul>

    <div class="flex justify-between mt-6">
      <button onclick="prevStep()" class="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg">← Back</button>
      <button onclick="goToNewAd()" class="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg">Create Ad →</button>
    </div>
  </div>

</div>

<!-- Alpine Logic -->
<script>
function locationStep() {
  return {
    countries: [],
    cities: [],
    selectedCountry: "",
    selectedCity: "",
    debug: "",
    debugCities: "",

    async init() {
      this.debug = "Loading countries…";
      try {
        const res = await fetch('/api/countries');
        const data = await res.json();
        this.countries = data;
        this.debug = `Loaded ${data.length} countries`;
      } catch {
        this.debug = "ERROR loading countries";
      }
    },

    async loadCities() {
      this.debugCities = `Loading cities for ${this.selectedCountry}…`;
      this.cities = [];
      this.selectedCity = "";

      if (!this.selectedCountry) return;

      try {
        const res = await fetch(`/api/cities?country=${this.selectedCountry}`);
        const data = await res.json();
        this.cities = data;
        this.debugCities = `Loaded ${data.length} cities`;
      } catch {
        this.debugCities = "ERROR loading cities";
      }
    }
  }
}

function categoryStep() {
  return {
    categories: [],
    subcategories: [],
    selectedCategory: null,
    selectedSubcategory: null,
    debug: "",
    debugSub: "",

    async init() {
      this.debug = "Loading categories…";
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        this.categories = data;
        this.debug = `Loaded ${data.length} categories`;
      } catch {
        this.debug = "ERROR loading categories";
      }
    },

    async loadSubcategories() {
      this.debugSub = "Loading subcategories…";
      this.subcategories = [];
      this.selectedSubcategory = null;

      if (!this.selectedCategory) return;

      try {
        const res = await fetch(`/api/subcategories?category=${this.selectedCategory.id}`);
        const data = await res.json();
        this.subcategories = data;
        this.debugSub = `Loaded ${data.length} subcategories`;
      } catch {
        this.debugSub = "ERROR loading subcategories";
      }
    }
  }
}

function summaryStep() {
  return {
    country: "",
    city: "",
    categorySlug: "",
    subcategorySlug: "",

    init() {
      const loc = document.querySelector('#step1').__x.$data;
      const cat = document.querySelector('#step2').__x.$data;

      this.country = loc.selectedCountry;
      this.city = loc.selectedCity;
      this.categorySlug = cat.selectedCategory?.slug || "";
      this.subcategorySlug = cat.selectedSubcategory?.slug || "";
    }
  }
}

// Step Navigation
window.nextStep = function () {
  const s1 = document.getElementById("step1");
  const s2 = document.getElementById("step2");
  const s3 = document.getElementById("step3");

  if (s1.style.display !== "none") {
    s1.style.display = "none";
    s2.style.display = "block";
    return;
  }

  if (s2.style.display !== "none") {
    s2.style.display = "none";
    s3.style.display = "block";
    return;
  }
};

window.prevStep = function () {
  const s1 = document.getElementById("step1");
  const s2 = document.getElementById("step2");
  const s3 = document.getElementById("step3");

  if (s3.style.display !== "none") {
    s3.style.display = "none";
    s2.style.display = "block";
    return;
  }

  if (s2.style.display !== "none") {
    s2.style.display = "none";
    s1.style.display = "block";
    return;
  }
};

window.goToNewAd = function () {
  const s1 = document.querySelector('#step1').__x.$data;
  const s2 = document.querySelector('#step2').__x.$data;

  const country = s1.selectedCountry;
  const city = s1.selectedCity;
  const category = s2.selectedCategory.slug;
  const sub = s2.selectedSubcategory?.slug;

  const url = sub
    ? `/${country}/${city}/${category}/${sub}/ads/new`
    : `/${country}/${city}/${category}/ads/new`;

  window.location.href = url;
};
</script>

</body>
</html>

