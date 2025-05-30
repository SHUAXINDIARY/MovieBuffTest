class MovieList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const data = localStorage.getItem("movie");
    const _arr = JSON.parse(data || "[]");
    this.selectedMovies = new Set(_arr);
    this.collapsedYears = new Set();
  }

  async connectedCallback() {
    try {
      const response = await fetch("assets/data/index.json");
      const data = await response.json();
      this.render(data);
    } catch (error) {
      console.error("Error loading movie data:", error);
    }
  }

  handleMovieClick(event) {
    const movieCard = event.currentTarget;
    const movieTitle = movieCard.querySelector(".movie-title").textContent;

    if (this.selectedMovies.has(movieTitle)) {
      this.selectedMovies.delete(movieTitle);
      movieCard.classList.remove("selected");
    } else {
      this.selectedMovies.add(movieTitle);
      movieCard.classList.add("selected");
    }

    // 触发自定义事件，通知外部选中状态变化
    this.dispatchEvent(
      new CustomEvent("selection-change", {
        detail: {
          selectedMovies: Array.from(this.selectedMovies),
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  handleYearToggle(event, year) {
    event.stopPropagation();
    const yearSection = event.currentTarget.closest(".year-section");
    const content = yearSection.querySelector(".movie-grid");
    const button = event.currentTarget;

    if (this.collapsedYears.has(year)) {
      this.collapsedYears.delete(year);
      content.classList.remove("collapsed");
      button.classList.remove("collapsed");
    } else {
      this.collapsedYears.add(year);
      content.classList.add("collapsed");
      button.classList.add("collapsed");
    }
  }

  render(data) {
    const years = Object.keys(data).sort((a, b) => b - a);

    const style = `
      <style>
        :host {
          display: block;
          font-family: system-ui, -apple-system, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .year-section {
          margin-bottom: 40px;
        }
        
        .year-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid #eee;
        }
        
        .year-title {
          font-size: 24px;
          color: #333;
          margin: 0;
        }

        .toggle-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toggle-button:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .toggle-button::before {
          content: '';
          width: 12px;
          height: 12px;
          border-right: 2px solid #666;
          border-bottom: 2px solid #666;
          transform: rotate(45deg);
          transition: transform 0.3s ease;
        }

        .toggle-button.collapsed::before {
          transform: rotate(-45deg);
        }
        
        .movie-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
          overflow: hidden;
          max-height: 2050px;
          opacity: 1;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-top: 16px;
          margin-bottom: 16px;
        }
        
        .movie-grid.collapsed {
          max-height: 0;
          opacity: 0;
          margin-top: 0;
          margin-bottom: 0;
        }
        
        .movie-card {
          background: #fff;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: all 0.2s ease;
          cursor: pointer;
          position: relative;
          min-height: 60px;
          display: flex;
          align-items: center;
        }
        
        .movie-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 8px;
          border: 2px solid transparent;
          transition: all 0.2s ease;
        }
        
        .movie-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .movie-card.selected {
          background-color: #e3f2fd;
        }
        
        .movie-card.selected::before {
          border-color: #2196f3;
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
        }
        
        .movie-title {
          font-size: 16px;
          color: #333;
          margin: 0;
          line-height: 1.4;
        }
      </style>
    `;

    const content = years
      .map(
        (year) => `
      <div class="year-section">
        <div class="year-header">
          <h2 class="year-title">${year}年</h2>
          <button class="toggle-button ${
            this.collapsedYears.has(year) ? "collapsed" : ""
          }" 
                  onclick="this.getRootNode().host.handleYearToggle(event, '${year}')">
          </button>
        </div>
        <div class="movie-grid ${
          this.collapsedYears.has(year) ? "collapsed" : ""
        }">
          ${data[year]
            .map(
              (movie) => `
            <div class="movie-card ${
              this.selectedMovies.has(movie) ? "selected" : ""
            }" data-movie="${movie}">
              <h3 class="movie-title">${movie}</h3>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `
      )
      .join("");

    this.shadowRoot.innerHTML = `${style}${content}`;

    // 添加点击事件监听器
    this.shadowRoot.querySelectorAll(".movie-card").forEach((card) => {
      card.addEventListener("click", this.handleMovieClick.bind(this));
    });
  }
}

customElements.define("movie-list", MovieList);
