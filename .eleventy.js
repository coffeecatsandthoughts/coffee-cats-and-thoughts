module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("images");
  
  eleventyConfig.addFilter("readableDate", function(date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC"
    }).format(date);
  });

  eleventyConfig.addCollection("blogPosts", function(collectionApi) {
    return collectionApi
      .getFilteredByGlob(["./posts/*.md", "./*.md"])
      .filter(item => item.data.layout === "post.njk")
      .sort((a, b) => b.date - a.date);
  });

    eleventyConfig.addFilter("previousPost", function(posts, currentUrl) {
    const index = posts.findIndex(post => post.url === currentUrl);
    return index >= 0 && index < posts.length - 1 ? posts[index + 1] : null;
  });

  eleventyConfig.addFilter("nextPost", function(posts, currentUrl) {
    const index = posts.findIndex(post => post.url === currentUrl);
    return index > 0 ? posts[index - 1] : null;
  });
  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
