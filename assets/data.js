(function (root) {
  "use strict";

  /*
   * Content model for Unique Unisex Fitness and Gym, Kumaran Nagar,
   * 100 Feet Road, Mudaliarpet, Pondicherry.
   *
   * Facts below come from the client-supplied Google Maps place
   * (https://maps.app.goo.gl/KbJBjfcGLrUxyGn37) and the Justdial listing
   * (services, unisex type, category list). Check them against the gym
   * before any public launch; nothing in this file should invent prices,
   * staff names, schedules, awards, or reviews.
   */
  var siteContent = {
    brand: {
      name: "Unique Fitness Gym",
      listingName: "Unique Unisex Fitness and Gym",
      tagline: "Gym training, CrossFit, yoga and one-to-one coaching in Mudaliarpet.",
      established: "2025",
      locality: "Mudaliarpet, Pondicherry"
    },
    navigation: [
      { label: "Story", href: "/#our-story" },
      { label: "Gym", href: "/#the-gym" },
      { label: "Training", href: "/#training" },
      { label: "Founder", href: "/#founder-story" },
      { label: "Reviews", href: "/#reviews" },
      { label: "Visit", href: "/#visit" }
    ],
    contact: {
      phoneDisplay: "099949 85599",
      phoneTel: "+919994985599",
      email: null,
      address: "No. 1, Kumaran Nagar, 100 Feet Road, Mudaliarpet, Pondicherry – 605004",
      addressShort: "Kumaran Nagar, 100 Feet Road, Mudaliarpet",
      hoursText: "Daily · 05:00–22:00"
    },
    hours: {
      label: "Open daily 05:00–22:00",
      open: "05:00",
      close: "22:00",
      text: "05:00–22:00"
    },
    location: {
      mapUrl: "https://maps.app.goo.gl/KbJBjfcGLrUxyGn37",
      embedUrl: "https://www.google.com/maps?q=11.9213916,79.8091034&z=17&output=embed",
      rating: "5.0",
      reviewCount: "20",
      sourceUrl: "https://www.justdial.com/Pondicherry/Unique-Unisex-Fitness-and-Gym-Kumaran-Nagar-Mudaliarpet/0413PX413-X413-250910211420-K1I9_BZDET"
    },
    assets: {
      hero: "/assets/images/location/exterior-night.jpg",
      ownerFrontPose: "/assets/images/founder/front-pose.jpg",
      ownerAchievements: "/assets/images/founder/achievement-wall.jpg",
      machine: "/assets/images/gym/strength-machines.jpg",
      cardioMachine: "/assets/images/gym/cardio-machines.jpg",
      dumbbellRack: "/assets/images/gym/dumbbell-rack.jpg",
      entrance: "/assets/images/gym/interior-entrance.jpg",
      facilityWide: "/assets/images/gym/training-floor.jpg",
      facilityDetail: "/assets/images/gym/equipment-detail.jpg",
      streetView: "/assets/images/location/street-view.jpg"
    },
    testimonials: [
      {
        quote: "Cleanliness is maintained well.",
        author: "rîyãj môhâmèd (rj)",
        detail: "Google review"
      },
      {
        quote: "New sets every day.",
        author: "Preedip Raj",
        detail: "Google review"
      },
      {
        quote: "The training was very effective.",
        author: "prakash dass",
        detail: "Google review"
      }
    ],
    services: [
      {
        id: "strength-training",
        name: "Gym access",
        value: "Daily · 05:00–22:00",
        description: "The training floor is open every day, from first light to late evening.",
        image: "/assets/images/gym/strength-machines.jpg",
        imageAlt: "Strength training equipment inside Unique Fitness Gym"
      },
      {
        id: "personal-training",
        name: "Personal training",
        value: "One-to-one",
        description: "The listing lists “Get Your Own Trainer” as a service: one-to-one coaching at your pace.",
        image: "/assets/images/services/personal-training.jpg",
        imageAlt: "Trainer coaching a client through a push-up during a personal training session"
      },
      {
        id: "crossfit",
        name: "CrossFit",
        value: "Listed session",
        description: "CrossFit is listed as a fitness option. Ask for current session times.",
        image: "/assets/images/services/crossfit-skierg.jpg",
        imageAlt: "Athlete training on a SkiErg, an open-licensed concept reference and not the gym"
      },
      {
        id: "yoga",
        name: "Yoga",
        value: "Listed session",
        description: "Yoga is listed as a fitness option. Ask which sessions are running.",
        image: "/assets/images/services/yoga-stretch.jpg",
        imageAlt: "Athlete stretching in a yoga hold, an open-licensed concept reference and not the gym"
      },
      {
        id: "meditation",
        name: "Meditation",
        value: "Listed session",
        description: "Meditation appears in the listing categories. Confirm availability.",
        image: "/assets/images/services/meditation-wellness.jpg",
        imageAlt: "Quiet meditation moment, an open-licensed concept reference and not the gym"
      },
      {
        id: "fitness-centre",
        name: "Fitness centre",
        value: "Unisex floor",
        description: "A unisex centre, described by the listing as open to both men and women.",
        image: "/assets/images/gym/equipment-detail.jpg",
        imageAlt: "Machinery detail inside Unique Fitness Gym"
      }
    ]
  };

  if (root) {
    root.UNIQUE_FITNESS_CONTENT = siteContent;
    root.UniqueFitnessContent = siteContent;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = siteContent;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
