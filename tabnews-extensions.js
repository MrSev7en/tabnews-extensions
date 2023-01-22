/**
 TabNews Extensions - build alpha v0.0.2

  __  __      _____          ______
 |  \/  |    / ____|        |____  |
 | \  / |_ _| (___   _____   __ / /__ _ __
 | |\/| | '__\___ \ / _ \ \ / // / _ \ '_ \
 | |  | | |  ____) |  __/\ V // /  __/ | | |
 |_|  |_|_| |_____/ \___| \_//_/ \___|_| |_|

 Copyright © MrSev7en 2023 - All Rights Reserved

 This project is licensed under the terms of the MIT license
 You can check license at https://github.com/MrSev7en/tabnews-extensions/blob/main/LICENSE

 All rights to original website and author's works under GNU General Public License v3.0
 For more details, check license at https://github.com/filipedeschamps/tabnews.com.br/blob/main/LICENSE

 Original project by Filipe Deschamps at https://github.com/filipedeschamps/tabnews.com.br
 Copyright © TabNews 2022 - All Rights Reserved
**/

/** ----- Script initialization ----- **/

// ==UserScript==
// @name         tabnews-extensions
// @namespace    https://github.com/MrSev7en/tabnews-extensions/
// @version      0.0.2
// @description  Attempt to extend tabnews.com.br functions.
// @author       @MrSev7en
// @match        https://www.tabnews.com.br/*
// @icon         https://www.tabnews.com.br/favicon.ico
// @grant        none
// ==/UserScript==

/** ----- Core ----- **/

class TabNewsExtensions {
  static extensions = [];

  // Initialzie the engine.
  init() {
    new MutationObserver(this.update)
      .observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true
      });

    console.log('[TabNewsExtensions] successfully initialized.');
  }

  /**
   * Inject extensions into core.
   * @param {Extension} extension Extension to inject.
   */
  inject(extension) {
    if (!TabNewsExtensions.extensions.some((e) => e.name === extension.name)) {
      TabNewsExtensions.extensions.push(extension);
    }
  }

  /**
   * Occours each mutation change.
   * @param {MutationRecord[]} mutationList List of mutation records.
   */
  update(mutationList) {
    const targets = mutationList.map((mutation) => mutation.target);
    const extensions = TabNewsExtensions.extensions.filter((extension) => {
      return targets.some((target) => target === extension.trigger);
    });

    if (extensions.length) {
      extensions.forEach((extension) => {
        if (!extension.mounted) {
          try {
            extension.mount();
            extension.mounted = true;
          } catch (err) {
            console.error(`Falied to mount extension '${extension.name}', reason: '${err}'.`);
          }
        }
      });
    }

    TabNewsExtensions.extensions.forEach((extension) => {
      if (extension.mounted) {
        extension.remount();
      }
    });
  }
}

/** ----- Extensions ----- **/

class Extension {
  name = '';
  description = '';
  trigger = '';
  mount = null;
  remount = null;
  mounted = false;

  /**
   * Create a new extension.
   * @param {string} name Name of extension.
   * @param {string} description Description of extension.
   * @param {string} trigger Trigger element (query selector).
   * @param {() => void} mount Function that occours when extension it is mounted.
   * @param {() => void} remount Function that occours each time extension it is remounted.
   */
  constructor(name, description, trigger, mount, remount) {
    this.name = name;
    this.description = description;
    this.trigger = document.querySelector(trigger);
    this.mount = mount;
    this.remount = remount;
    this.mounted = false;
  }
}

/** ----- Search extension ----- **/

class SearchExtension extends Extension {
  searchingPage = 1;
  searchType = 'relevant';

  constructor() {
    super(
      'search-extension',
      'Search for posts on tabnews.com.br',
      '#header',
      () => this.initialize(),
      () => {
        const container = document.getElementById('tabnews-extensions@search-container');

        if (!container) {
          if (window.location.pathname === '/recentes') {
            this.searchType = 'new';
          } else {
            this.searchType = 'relevant';
          }

          this.createExtensionContainer();
          this.stylizeExtensionContainer();
          this.bindExtensionContainerInput();
        }
      }
    );
  }

  initialize() {
    try {
      if (window.location.pathname === '/recentes') {
        this.searchType = 'new';
      } else {
        this.searchType = 'relevant';
      }

      this.createExtensionContainer();
      this.stylizeExtensionContainer();
      this.bindExtensionContainerInput();
      this.animateExtensionContainerModalSearchLoader();

      console.log('[SearchExtension] successfully initialized.');
    } catch (err) {
      console.error(`[SearchExtension] failed to initialize, reason: '${err}'.`);
    }
  }

  createExtensionContainer() {
    const header = document.getElementById('header');
    const coins = header.children[3];
    const container = document.createElement('div');
    const input = document.createElement('input');
    const modal = document.createElement('div');

    container.setAttribute('id', 'tabnews-extensions@search-container');
    input.setAttribute('id', 'tabnews-extensions@search-input');
    modal.setAttribute('id', 'tabnews-extensions@search-modal');

    input.setAttribute('type', 'search');
    input.setAttribute('maxlength', '128');

    if (this.searchType === 'new') {
      input.setAttribute('placeholder', 'Pesquisar nos tópicos mais recentes...');
    } else {
      input.setAttribute('placeholder', 'Pesquisar nos tópicos revelantes...');
    }

    container.appendChild(input);
    container.appendChild(modal);

    header.insertBefore(container, coins);
  }

  stylizeExtensionContainer() {
    const header = document.getElementById('header');
    const recents = header.children[2];
    const container = document.getElementById('tabnews-extensions@search-container');
    const input = document.getElementById('tabnews-extensions@search-input');
    const modal = document.getElementById('tabnews-extensions@search-modal');

    container.style.marginRight = '16px';
    container.style.position = 'relative';
    container.style.display = 'flex';
    container.style.alignSelf = 'stretch';
    container.style.flex = '1 1 auto';
    container.style.flexWrap = 'nowrap';

    input.style.backgroundColor = '#303740';
    input.style.color = '#fff';
    input.style.width = '100%';
    input.style.height = '32px';
    input.style.padding = '0 16px';
    input.style.border = 'none';
    input.style.borderRadius = '6px';
    input.style.outline = 'none';

    modal.style.backgroundColor = '#fff';
    modal.style.width = '100%';
    modal.style.height = '40vh';
    modal.style.margin = '16px 0 0 0';
    modal.style.padding = '16px';
    modal.style.position = 'absolute';
    modal.style.left = '0';
    modal.style.top = '100%';
    modal.style.display = 'none';
    modal.style.flexDirection = 'column';
    modal.style.gap = '0.5em';
    modal.style.border = '1px solid #d0d7de';
    modal.style.borderRadius = '6px';
    modal.style.zIndex = '32768';
    modal.style.overflow = 'hidden auto';
    modal.style.boxShadow = '0 0 16px 8px #0001';

    recents.style.flex = '0 0 auto';
  }

  bindExtensionContainerInput() {
    const input = document.getElementById('tabnews-extensions@search-input');
    let timer;

    input.addEventListener('input', () => {
      const loader = document.getElementById('tabnews-extensions@search-modal-loader');

      if (input.value.length && !loader) {
        this.searchingPage = 1;
        this.clearExtensionContainerModal();
        this.showExtensionContainerModal();
        this.createExtensionContainerModalSearch();
      } else if (!input.value.length) {
        this.hideExtensionContainerModal();
        this.clearExtensionContainerModal();
      }
    });

    input.addEventListener('keyup', () => {
      clearTimeout(timer);

      if (input.value.length) {
        timer = setTimeout(async () => {
          await this.fetchExtensionContainerModalResponses(1, this.searchType);
        }, 1500);
      }
    });
  }

  showExtensionContainerModal() {
    const modal = document.getElementById('tabnews-extensions@search-modal');

    if (modal) {
      modal.style.display = 'flex';
    }
  }

  hideExtensionContainerModal() {
    const modal = document.getElementById('tabnews-extensions@search-modal');

    if (modal) {
      modal.style.display = 'none';
    }
  }

  clearExtensionContainerModal() {
    const modal = document.getElementById('tabnews-extensions@search-modal');

    if (modal) {
      modal.innerHTML = '';
    }
  }

  createExtensionContainerModalSearch() {
    const modal = document.getElementById('tabnews-extensions@search-modal');
    const text = document.createElement('span');
    const loader = document.createElement('div');

    if (this.searchType === 'new') {
      text.innerHTML = 'Pesquisando nos tópicos mais recentes...';
    } else {
      text.innerHTML = 'Pesquisando nos tópicos relevantes...';
    }

    text.style.color = '#24292f';
    text.style.margin = 'auto auto 0 auto';
    text.style.fontSize = '18px';
    text.style.fontWeight = '500';

    loader.style.background = "url('https://cdn.discordapp.com/attachments/1045769023847149580/1066587362307620904/loader-2.svg') no-repeat center center";
    loader.style.backgroundSize = 'contain';
    loader.style.objectFit = 'contain';
    loader.style.width = '24px';
    loader.style.height = '24px';
    loader.style.margin = '0 auto auto auto';

    loader.setAttribute('id', 'tabnews-extensions@search-modal-loader');

    modal.appendChild(text);
    modal.appendChild(loader);
  }

  createExtensionContainerModalSearchNotFound() {
    const modal = document.getElementById('tabnews-extensions@search-modal');
    const text = document.createElement('span');

    text.innerHTML = 'Nenhum resultado foi encontrado';
    text.style.color = '#24292f';
    text.style.margin = 'auto auto 0 auto';
    text.style.fontSize = '18px';
    text.style.fontWeight = '500';

    modal.appendChild(text);
  }

  animateExtensionContainerModalSearchLoader() {
    let angle = 0;

    setInterval(() => {
      const loader = document.getElementById('tabnews-extensions@search-modal-loader');

      if (loader) {
        loader.style.transform = `rotateZ(${angle}deg)`;
      }

      if (angle > 350) {
        angle = 0;
      }

      angle += 10;
    }, 25);
  }

  /**
   * @param {number} page
   */
  async fetchExtensionContainerModalResponses(page, type) {
    const input = document.getElementById('tabnews-extensions@search-input');
    const query = input.value;

    const response = await fetch(`https://www.tabnews.com.br/api/v1/contents?page=${page}&per_page=100&strategy=${type}`);
    const json = await response.json();
    const posts = json.filter((post) => post.title.toLowerCase().includes(query.toLowerCase()));;

    if (posts.length) {
      this.clearExtensionContainerModal();
      this.createExtensionContainerModalResponseTitle(posts.length);

      for (let i = 0; i < posts.length; i++) {
        this.createExtensionContainerModalResponse(
          i + 1,
          posts[i].title,
          posts[i].tabcoins,
          posts[i].children_deep_count,
          posts[i].owner_username,
          posts[i].created_at,
          posts[i].slug
        );
      }

      this.createExtensionContainerModalResponseLoad(false, this.searchingPage > 1);
    } else {
      this.clearExtensionContainerModal();
      this.createExtensionContainerModalSearchNotFound();
      this.createExtensionContainerModalResponseLoad(true, this.searchingPage > 1);
    }
  }

  /**
   * @param {number} amount
   */
  createExtensionContainerModalResponseTitle(amount) {
    const modal = document.getElementById('tabnews-extensions@search-modal');
    const text = document.createElement('span');

    text.style.color = '#6e7781';
    text.style.fontSize = '14px';
    text.style.fontWeight = '500';

    if (amount === 1) {
      text.innerHTML = `Foi encontrado 1 resultado (página ${this.searchingPage})`
    } else {
      text.innerHTML = `Foram encontrados ${amount} resultados (página ${this.searchingPage})`
    }

    modal.appendChild(text);
  }

  /**
   * @param {boolean} autoMargin
   * @param {boolean} backButtonEnabled
   */
  createExtensionContainerModalResponseLoad(autoMargin, backButtonEnabled) {
    const modal = document.getElementById('tabnews-extensions@search-modal');
    const collection = document.createElement('div');
    const backButton = document.createElement('button');
    const nextButton = document.createElement('button');

    collection.style.display = 'flex';
    collection.style.flexDirection = 'row';
    collection.style.gap = '0.5em';

    backButton.style.background = '#24292f';
    backButton.style.color = '#fff';
    backButton.style.width = 'fit-content';
    backButton.style.padding = '8px 16px';
    backButton.style.border = 'none';
    backButton.style.borderRadius = '6px';
    backButton.style.outline = 'none';
    backButton.style.cursor = 'pointer';

    nextButton.style.background = '#24292f';
    nextButton.style.color = '#fff';
    nextButton.style.width = 'fit-content';
    nextButton.style.padding = '8px 16px';
    nextButton.style.border = 'none';
    nextButton.style.borderRadius = '6px';
    nextButton.style.outline = 'none';
    nextButton.style.cursor = 'pointer';

    if (autoMargin) {
      collection.style.margin = '0 auto auto auto';
    } else {
      collection.style.margin = '0 auto';
    }

    backButton.innerHTML = 'Voltar para página anterior';
    nextButton.innerHTML = 'Procurar na próxima página';

    if (backButtonEnabled) collection.appendChild(backButton);
    collection.appendChild(nextButton);

    modal.appendChild(collection);

    if (backButtonEnabled) {
      backButton.addEventListener('click', async () => {
        this.clearExtensionContainerModal();
        this.showExtensionContainerModal();
        this.createExtensionContainerModalSearch();

        this.searchingPage -= 1;
        await this.fetchExtensionContainerModalResponses(this.searchingPage, this.searchType);
      });
    }

    nextButton.addEventListener('click', async () => {
      this.clearExtensionContainerModal();
      this.showExtensionContainerModal();
      this.createExtensionContainerModalSearch();

      this.searchingPage += 1;
      await this.fetchExtensionContainerModalResponses(this.searchingPage, this.searchType);
    });
  }

  /**
   * @param {number} id
   * @param {string} title
   * @param {number} tabCoins
   * @param {number} commentsCount
   * @param {string} author
   * @param {string} date
   * @param {string} slug
   */
  createExtensionContainerModalResponse(
    id,
    title,
    tabCoins,
    commentsCount,
    author,
    date,
    slug
  ) {
    const modal = document.getElementById('tabnews-extensions@search-modal');
    const response = document.createElement('div');
    const index = document.createElement('span');
    const info = document.createElement('div');
    const content = document.createElement('a');
    const description = document.createElement('span');

    response.style.display = 'flex';
    response.style.flexDirection = 'row';
    response.style.gap = '0.5em';

    index.style.color = '#24292f';
    index.style.fontSize = '16px';
    index.style.fontWeight = '500';

    info.style.display = 'flex';
    info.style.flexDirection = 'column';

    content.style.color = '#24292f';
    content.style.width = 'fit-content';
    content.style.fontSize = '16px';
    content.style.fontWeight = '500';
    content.style.cursor = 'pointer';
    content.style.textDecoration = 'none';
    content.style.textOverflow = 'ellipsis';
    content.style.overflow = 'hidden';
    content.style.whiteSpace = 'nowrap';

    description.style.color = '#6e7781';
    description.style.fontSize = '12px';

    index.innerHTML = `${id}.`;
    content.innerHTML = title;
    description.innerHTML = `${tabCoins} tabcoin${((tabCoins !== -1 && tabCoins !== 1) ? 's' : '')} · ${commentsCount} comentário${((commentsCount !== -1 && commentsCount) !== 1 ? 's' : '')} · ${author} · ${this.createExtensionContainerModalResponseParseTime(date)}`;

    content.setAttribute('href', `/${author}/${slug}`);

    info.appendChild(content);
    info.appendChild(description);

    response.appendChild(index);
    response.appendChild(info);

    modal.appendChild(response);

    content.addEventListener('mouseenter', () => (content.style.textDecoration = 'underline'));
    content.addEventListener('mouseleave', () => (content.style.textDecoration = 'none'));
  }

  /**
   * @param {number | string} date
   */
  createExtensionContainerModalResponseParseTime(date) {
    const elapsed = Date.now() - new Date(date).getTime()
    const seconds = Math.round(elapsed / 1000)
    const minutes = Math.round(elapsed / (60 * 1000))
    const hours = Math.round(elapsed / (60 * 1000 * 60))
    const days = Math.round(elapsed / (60 * 1000 * 60 * 24))
    const weeks = Math.round(elapsed / (60 * 1000 * 60 * 24 * 7))
    const months = Math.round(elapsed / (60 * 1000 * 60 * 24 * 30))
    const years = Math.round(elapsed / (60 * 1000 * 60 * 24 * 365))

    switch (true) {
      case seconds < 60: return 'agora mesmo'
      case minutes < 60: return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`
      case hours < 24: return `${hours} hora${hours > 1 ? 's' : ''} atrás`
      case days < 7: return `${days} dia${days > 1 ? 's' : ''} atrás`
      case weeks < 4: return `${weeks} semana${weeks > 1 ? 's' : ''} atrás`
      case months < 12: return `${months} m${months > 1 ? 'eses' : 'ês'} atrás`
      default: return `${years} ano${years > 1 ? 's' : ''} atrás`
    }
  }
}

/** ----- Script injection ----- **/

(function() {
  'use strict';

  const engine = new TabNewsExtensions();
  const searchExtension = new SearchExtension();

  engine.init();
  engine.inject(searchExtension);
})();
