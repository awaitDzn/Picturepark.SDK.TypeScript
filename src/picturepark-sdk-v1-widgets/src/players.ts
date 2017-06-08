/// <reference path="./typings/pdfjs.d.ts" />
/// <reference path="../../picturepark-sdk-v1-fetch/dist/picturepark.d.ts" />

import * as picturepark from 'picturepark';

declare var PhotoSwipe;
declare var PhotoSwipeUI_Default;
declare var jwplayer;

export class PictureparkPlayers {
  static loading = false; 

  static showPrevious(elementId: string) {
    let gallery = PictureparkPlayers.getGallery(elementId);

    let newIndex = gallery.index - 1;
    if (newIndex < 0)
      newIndex = gallery.children.length - 1;

    gallery.children[gallery.index].element.style.display = 'none';
    gallery.children[newIndex].element.style.display = '';
  }

  static showNext(elementId: string) {
    let gallery = PictureparkPlayers.getGallery(elementId);

    let newIndex = gallery.index + 1;
    if (newIndex === gallery.children.length)
      newIndex = 0;

    gallery.children[gallery.index].element.style.display = 'none';
    gallery.children[newIndex].element.style.display = '';
  }

  private static getGallery(elementId: string) {
    let element = document.getElementById(elementId);
    let children = [];
    let visibleIndex = -1;
    for (var i = 0; i < element.children.length; i++) {
      let child = element.children[i] as HTMLDivElement;
      let isVisible = child.style.display !== "none";
      children.push({ index: i, visible: isVisible, element: child });
      if (isVisible) {
        visibleIndex = i;
      }
    }
    return { children: children, index: visibleIndex };
  }

  static showDetail(token: string, contentId: string) {
    if (PictureparkPlayers.loading) return;
    PictureparkPlayers.loading = true;
    
    let share: picturepark.ShareEmbedDetailViewItem = (<any>document).pictureparkShareCache[token];

    let embedItem: any = share.EmbedContentItems.filter(i => i.ContentId === contentId && i.OutputFormatId === "Preview")[0];
    let originalEmbedItem = share.EmbedContentItems.filter(i => i.ContentId === contentId && i.OutputFormatId === "Original")[0];

    if (!embedItem)
      embedItem = originalEmbedItem;

    let outputs: picturepark.OutputViewItem[] = share.ContentSelections
      .reduce((c, s) => c.concat(s.Outputs), []);

    let selections: any = outputs
      .filter(i => i.OutputFormatId === embedItem.OutputFormatId)
      .map(s => {
        return {
          Url: share.EmbedContentItems.filter(e => e.ContentId === s.ContentId && e.OutputFormatId === s.OutputFormatId)[0].Url,
          ...s
        }
      });

    let selection: any = selections.filter(i => i.ContentId == contentId)[0];
    let originalSelection = outputs.filter(i => i.ContentId === contentId && i.OutputFormatId === "Original")[0];

    if (originalSelection.Detail.FileExtension === '.pdf') {
      this.showPdfJsItem(originalEmbedItem);
      PictureparkPlayers.loading = false;
    } else {
      this.showPhotoSwipeItem(selection, selections, outputs).then(() => {
        PictureparkPlayers.loading = false;
      });
    }
  }

  static renderVideoPlayer(config: any, contentId: string, elementId: string) {
    let share: picturepark.ShareEmbedDetailViewItem = (<any>document).pictureparkShareCache[config.token];
    let embedItem: any = share.EmbedContentItems.filter(i => i.ContentId === contentId && i.OutputFormatId === "Preview")[0];
    let originalEmbedItem = share.EmbedContentItems.filter(i => i.ContentId === contentId && i.OutputFormatId === "Original")[0];
    let outputs: picturepark.OutputViewItem[] = share.ContentSelections
      .reduce((c, s) => c.concat(s.Outputs), []);
    let originalSelection = outputs.filter(i => i.ContentId === contentId && i.OutputFormatId === "Original")[0];

    this.loadScript("https://content.jwplatform.com/libraries/L7fM8L0h.js").then(() => {
      const player = jwplayer(elementId).setup({
        autostart: false,
        image: embedItem.Url,
        file: originalEmbedItem.Url,
        type: originalSelection.Detail.FileExtension.substr(1),
        volume: 10, 
        width: parseInt(config.width),
        height: parseInt(config.height)
      });
    });
  }

  static getScriptsPath() {
    let scriptFile = 'picturepark-widgets.js';
    for (let tag of document.getElementsByTagName('script')) {
      if (tag.src.indexOf(scriptFile) !== -1)
        return tag.src.substring(0, tag.src.length - scriptFile.length)
    }
    return undefined;
  }

  static showPdfJsItem(embedItem: picturepark.EmbedContentViewItem) {
    let iframeElement = document.createElement("iframe");
    iframeElement.style.position = 'fixed';
    iframeElement.style.left = '0';
    iframeElement.style.top = '0';
    iframeElement.style.width = '100%';
    iframeElement.style.height = '100%';
    iframeElement.src = this.getScriptsPath() + '/pdfjs/viewer.html?file=' + embedItem.Url;

    let prevOverflow = document.body.style.overflow;
    let keydownCallback = (e: KeyboardEvent) => {
      let event = e || <KeyboardEvent>window.event;
      let isEscape = "key" in event ? (event.key == "Escape" || event.key == "Esc") : (event.keyCode == 27);
      if (isEscape) {
        closeCallback();
      }
    };

    let closeCallback = () => {
      document.body.removeChild(iframeElement);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', keydownCallback, true);
    };

    iframeElement.onload = (e) => {
      document.body.style.overflow = 'hidden';
      if (iframeElement.contentWindow.location.href === 'about:blank')
        closeCallback();
    };

    document.addEventListener('keydown', keydownCallback, true);
    document.body.appendChild(iframeElement);
  }

  static showPhotoSwipeItem(selection, selections, outputs: picturepark.OutputViewItem[]) {
    return this.loadPhotoSwipe().then(element => {
      let originalOutputs = outputs.filter(o => o.OutputFormatId === 'Original');
      let hasOnlyImages = originalOutputs
        .map(s => s.Detail.FileExtension)
        .filter(e => e === '.jpg' || e === 'jpeg' || e === 'png' || e === 'gif')
        .length === originalOutputs.length;

      let items = hasOnlyImages ? selections.map(s => {
        return {
          src: s.Url,
          w: s.Detail.Width,
          h: s.Detail.Height
        };
      }) : [{
          src: selection.Url,
          w: selection.Detail.Width,
          h: selection.Detail.Height
      }];

      var gallery = new PhotoSwipe(element, PhotoSwipeUI_Default, items, { index: selections.indexOf(selection) })
      gallery.init();
    });
  }

  static loadPhotoSwipe(): Promise<Element> {
    let element = document.querySelectorAll('.pswp')[0];
    if (element)
      return Promise.resolve(element);

    return Promise.all([
      this.loadCss("https://cdn.rawgit.com/dimsemenov/PhotoSwipe/master/dist/photoswipe.css"),
      this.loadCss("https://cdn.rawgit.com/dimsemenov/PhotoSwipe/master/dist/default-skin/default-skin.css"),
      this.loadScript("https://cdn.rawgit.com/dimsemenov/PhotoSwipe/master/dist/photoswipe.min.js"),
      this.loadScript("https://cdn.rawgit.com/dimsemenov/PhotoSwipe/master/dist/photoswipe-ui-default.min.js")
    ]).then(() => {
      var markup = `
        <!-- Root element of PhotoSwipe. Must have class pswp. -->
        <div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">

            <!-- Background of PhotoSwipe. 
                It's a separate element as animating opacity is faster than rgba(). -->
            <div class="pswp__bg"></div>

            <!-- Slides wrapper with overflow:hidden. -->
            <div class="pswp__scroll-wrap">

                <!-- Container that holds slides. 
                    PhotoSwipe keeps only 3 of them in the DOM to save memory.
                    Don't modify these 3 pswp__item elements, data is added later on. -->
                <div class="pswp__container">
                    <div class="pswp__item"></div>
                    <div class="pswp__item"></div>
                    <div class="pswp__item"></div>
                </div>

                <!-- Default (PhotoSwipeUI_Default) interface on top of sliding area. Can be changed. -->
                <div class="pswp__ui pswp__ui--hidden">

                    <div class="pswp__top-bar">

                        <!--  Controls are self-explanatory. Order can be changed. -->

                        <div class="pswp__counter"></div>

                        <button class="pswp__button pswp__button--close" title="Close (Esc)"></button>
                        <button class="pswp__button pswp__button--share" title="Share"></button>
                        <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>
                        <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>

                        <!-- Preloader demo http://codepen.io/dimsemenov/pen/yyBWoR -->
                        <!-- element will get class pswp__preloader--active when preloader is running -->
                        <div class="pswp__preloader">
                            <div class="pswp__preloader__icn">
                            <div class="pswp__preloader__cut">
                                <div class="pswp__preloader__donut"></div>
                            </div>
                            </div>
                        </div>
                    </div>

                    <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
                        <div class="pswp__share-tooltip"></div> 
                    </div>

                    <button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)">
                    </button>

                    <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)">
                    </button>

                    <div class="pswp__caption">
                        <div class="pswp__caption__center"></div>
                    </div>
                </div>
            </div>
        </div>`;

      var divElement = document.createElement("div");
      divElement.id = "photoswipe";
      divElement.innerHTML = markup;

      document.body.appendChild(divElement);
      return document.querySelectorAll('.pswp')[0];
    });
  }

  static loadScript(url: string): Promise<void> {
    return new Promise<void>((resolve) => {
      var scriptTag = document.createElement('script');
      scriptTag.src = url;
      scriptTag.async = true;
      scriptTag.onload = () => resolve();
      document.head.appendChild(scriptTag);
    });
  }

  static loadCss(url): Promise<void> {
    return new Promise<void>((resolve) => {
      var linkElement = document.createElement("link");
      linkElement.type = "text/css";
      linkElement.rel = "stylesheet";
      linkElement.href = url;
      linkElement.onload = () => resolve();

      document.getElementsByTagName("head")[0].appendChild(linkElement);
    });
  }
}