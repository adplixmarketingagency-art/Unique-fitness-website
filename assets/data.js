(function (root) {
  "use strict";

  /*
   * Shared, provisional content model for the Unique Fitness Gym site.
   * Keep values in this file easy to replace when the gym confirms its
   * contact details, service copy, blog information, and external links.
   */
  var siteContent = {
    brand: {
      name: "Unique Fitness Gym",
      shortName: "Unique Fitness",
      listingName: "Unique Unisex Fitness and Gym",
      tagline: "Train different. Show up stronger.",
      established: "2025",
      status: "Provisional website content"
    },
    navigation: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about/" },
      { label: "Services", href: "/services/" },
      { label: "Blog", href: "/blog/" },
      { label: "Contact", href: "/contact/" }
    ],
    assets: {
      hero: "/assets/optimized/Outer-look.jpg",
      ownerBodyPose: "/assets/optimized/Gym-owner-body-pose.jpg",
      machine: "/assets/optimized/GYm-machine.jpg",
      cardioMachine: "/assets/optimized/cardio-machine2.jpg",
      dumbbellRack: "/assets/optimized/dumbell-rack.jpg",
      entrance: "/assets/optimized/interior-entrance.jpg",
      facilityWide: "/assets/optimized/wide-angle-click.jpg",
      facilityDetail: "/assets/optimized/unnamed.jpg",
      externalCrossfit: "/assets/external/crossfit-skierg-jpg.jpg",
      externalYoga: "/assets/external/yoga-stretch-jpg.jpg",
      externalMeditation: "/assets/external/meditation-wellness-2026.jpg",
      providedStreetView: "/assets/provided/mudaliarpet-street-view.jpg"
    },
    placeholders: {
      phone: "099949 85599",
      email: "[Email address to be added]",
      streetAddress: "No. 1, Kumaran Nagar, 100 Feet Road, Mudaliarpet",
      city: "Pondicherry",
      region: "Puducherry",
      postalCode: "605004",
      country: "India",
      hours: "05:00–22:00",
      socialLink: "[Social link to be added]",
      appLink: "[App link to be added]",
      author: "[Blog author to be added]",
      date: "[Publication date to be added]",
      serviceDescription: "[Service description to be added]",
      siteUrl: "[Website URL to be configured]",
      formEndpoint: "[Contact form endpoint to be configured]"
    },
    contact: {
      phone: "099949 85599",
      email: "[Email address to be added]",
      address: "No. 1, Kumaran Nagar, 100 Feet Road, Mudaliarpet, Pondicherry – 605004",
      hours: "Daily · 05:00–22:00"
    },
    location: {
      mapUrl: "https://maps.app.goo.gl/KbJBjfcGLrUxyGn37",
      embedUrl: "https://www.google.com/maps?q=11.9213916,79.8091034&z=17&output=embed",
      rating: "5.0",
      reviewCount: "20",
      sourceUrl: "https://www.justdial.com/Pondicherry/Unique-Unisex-Fitness-and-Gym-Kumaran-Nagar-Mudaliarpet/0413PX413-X413-250910211420-K1I9_BZDET"
    },
    testimonials: [
      {
        quote: "Cleanliness is maintained well.",
        author: "rîyãj môhámèd (rj)",
        detail: "Google review · 7 months ago"
      },
      {
        quote: "New sets every day.",
        author: "Preedip Raj",
        detail: "Google review · 7 months ago"
      },
      {
        quote: "The training was very effective.",
        author: "prakash dass",
        detail: "Google review · 8 months ago"
      }
    ],
    socialLinks: [],
    appLinks: [],
    services: [
      {
        id: "strength-training",
        name: "Gym access",
        description: "General gym access is listed for the facility. Confirm membership options and access rules.",
        image: "/assets/optimized/GYm-machine.jpg",
        imageAlt: "Strength training equipment inside the gym"
      },
      {
        id: "crossfit",
        name: "CrossFit",
        description: "CrossFit is listed as a fitness option. Confirm class format, schedule, and coaching details.",
        image: "/assets/external/crossfit-skierg-jpg.jpg",
        imageAlt: "External CrossFit workout reference, not a photo of Unique Fitness Gym"
      },
      {
        id: "yoga",
        name: "Yoga",
        description: "Yoga is listed as a fitness option. Confirm sessions, availability, and booking details.",
        image: "/assets/external/yoga-stretch-jpg.jpg",
        imageAlt: "External yoga reference, not a photo of Unique Fitness Gym"
      },
      {
        id: "personal-training",
        name: "Personal training",
        description: "Get Your Own Trainer is listed as a service. Confirm trainer availability and formats.",
        image: "/assets/optimized/Gym-owner-body-pose.jpg",
        imageAlt: "Training portrait inside Unique Fitness Gym"
      },
      {
        id: "fitness-centre",
        name: "Fitness centre",
        description: "The listing describes the business as a fitness centre. Confirm amenities and access details.",
        image: "/assets/optimized/unnamed.jpg",
        imageAlt: "Interior detail inside Unique Fitness Gym"
      },
      {
        id: "meditation",
        name: "Meditation",
        description: "Meditation classes appear in the listing categories. Confirm whether sessions are currently offered.",
        image: "/assets/external/meditation-wellness-2026.jpg",
        imageAlt: "External meditation class reference, not a photo of Unique Fitness Gym"
      }
    ],
    blog: {
      posts: [
        {
          slug: "post.html#facility",
          title: "Inside the facility",
          excerpt: "A planned photo note about the supplied training-floor views and the facility experience.",
          author: "[Blog author to be added]",
          date: "[Publication date to be added]",
          image: "/assets/optimized/Gym-owner-body-pose.jpg",
          imageAlt: "Gym owner training portrait supplied for the website"
        },
        {
          slug: "post.html#training",
          title: "CrossFit, yoga, or gym access?",
          excerpt: "A planned guide to the fitness options named in the public listing.",
          author: "[Blog author to be added]",
          date: "[Publication date to be added]",
          image: "/assets/external/crossfit-skierg-jpg.jpg",
          imageAlt: "External CrossFit workout reference on a SkiErg"
        },
        {
          slug: "post.html#location",
          title: "Finding the gym in Mudaliarpet",
          excerpt: "A planned location note covering the 100 Feet Road address, hours, and directions.",
          author: "[Blog author to be added]",
          date: "[Publication date to be added]",
          image: "/assets/provided/mudaliarpet-street-view.jpg",
          imageAlt: "Street-view image of Unique Fitness Gym in Mudaliarpet"
        }
      ]
    }
  };

  if (root) {
    root.UNIQUE_FITNESS_CONTENT = siteContent;
    root.UniqueFitnessContent = siteContent;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = siteContent;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
