(function($) {
    $.fn.mauGallery = function(options) {
      var options = $.extend($.fn.mauGallery.defaults, options);
      var tagsCollection = [];
      return this.each(function() {
        $.fn.mauGallery.methods.createRowWrapper($(this));
        if (options.lightBox) {
          $.fn.mauGallery.methods.createLightBox(
            $(this),
            options.lightboxId,
            options.navigation
          );
        }
        $.fn.mauGallery.listeners(options);
  
        $(this)
          .children(".gallery-item")
          .each(function(index) {
            $.fn.mauGallery.methods.responsiveImageItem($(this));
            $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
            $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
            var theTag = $(this).data("gallery-tag");
            if (
              options.showTags &&
              theTag !== undefined &&
              tagsCollection.indexOf(theTag) === -1
            ) {
              tagsCollection.push(theTag);
            }
          });
  
        if (options.showTags) {
          $.fn.mauGallery.methods.showItemTags(
            $(this),
            options.tagsPosition,
            tagsCollection
          );
        }
  
        $(this).fadeIn(500);
      });
    };
    $.fn.mauGallery.defaults = {
      columns: 3,
      lightBox: true,
      lightboxId: null,
      showTags: true,
      tagsPosition: "bottom",
      navigation: true
    };
    $.fn.mauGallery.listeners = function(options) {
      $(".gallery-item").on("click", function() {
        if (options.lightBox && $(this).prop("tagName") === "IMG") {
          $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
        } else {
          return;
        }
      });
  
      $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
      $(".gallery").on("click", ".mg-prev", () =>
        $.fn.mauGallery.methods.prevImage(options.lightboxId)
      );
      $(".gallery").on("click", ".mg-next", () =>
        $.fn.mauGallery.methods.nextImage(options.lightboxId)
      );
    };
    $.fn.mauGallery.methods = {
      createRowWrapper(element) {
        if (
          !element
            .children()
            .first()
            .hasClass("row")
        ) {
          element.append('<div class="gallery-items-row row"></div>');
        }
      },
      wrapItemInColumn(element, columns) {
        if (columns.constructor === Number) {
          element.wrap(
            `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
          );
        } else if (columns.constructor === Object) {
          var columnClasses = "";
          if (columns.xs) {
            columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
          }
          if (columns.sm) {
            columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
          }
          if (columns.md) {
            columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
          }
          if (columns.lg) {
            columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
          }
          if (columns.xl) {
            columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
          }
          element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
        } else {
          console.error(
            `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
          );
        }
      },
      moveItemInRowWrapper(element) {
        element.appendTo(".gallery-items-row");
      },
      responsiveImageItem(element) {
        if (element.prop("tagName") === "IMG") {
          element.addClass("img-fluid");
        }
        let src = element.attr("src");
        if (src.startsWith("/assets/")) {
            element.attr("src", src.replace(/^\/assets/, "./assets"));
        }
      },
      openLightBox(element, lightboxId) {
        console.log(element);
        let originalSrc = element.attr("src");
        let correctedSrc = originalSrc.replace(/^\/assets/, "./assets");
        let largeImageSrc = correctedSrc.replace(/\.\w+$/, "-large.webp");
        $(`#${lightboxId}`).find(".lightboxImage").attr("src", largeImageSrc);
        $(`#${lightboxId}`).modal("toggle");
      },
      prevImage() {
        let activeImageSrc = $(".lightboxImage").attr("src");
        let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
    
        let imagesCollection = [];
    
        // Collect images based on active tag
        if (activeTag === "all") {
            imagesCollection = $(".item-column img.gallery-item").toArray();
        } else {
            $(".item-column img.gallery-item").each(function() {
                if ($(this).data("gallery-tag") === activeTag) {
                    imagesCollection.push(this); 
                }
            });
        }
        let index = imagesCollection.findIndex(img => {
            let imgSrc = $(img).attr("src").replace(/\.\w+$/, "-large.webp");
            return imgSrc === activeImageSrc;
        });
        if (index === -1) index = imagesCollection.length;
        let prevIndex = (index > 0) ? index - 1 : imagesCollection.length - 1;
        let smallSrc = $(imagesCollection[prevIndex]).attr("src");
        let largeSrc = smallSrc.replace(/\.\w+$/, "-large.webp");
        $(".lightboxImage").attr("src", largeSrc);
    },
    nextImage() {
      let activeImageSrc = $(".lightboxImage").attr("src");
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
  
      let imagesCollection = [];
  
      // Collect images based on active tag
      if (activeTag === "all") {
          imagesCollection = $(".item-column img.gallery-item").toArray();
      } else {
          $(".item-column img.gallery-item").each(function() {
              if ($(this).data("gallery-tag") === activeTag) {
                  imagesCollection.push(this); // Push raw DOM element
              }
          });
      }
  
      // Find current image index in the array
      let index = imagesCollection.findIndex(img => {
          let imgSrc = $(img).attr("src").replace(/\.\w+$/, "-large.webp");
          return imgSrc === activeImageSrc;
      });
  
      // If not found, default to first image
      if (index === -1) index = 0;
  
      // Move to next image (loop back if needed)
      let nextIndex = (index < imagesCollection.length - 1) ? index + 1 : 0;
  
      // Convert small image src to large version
      let smallSrc = $(imagesCollection[nextIndex]).attr("src");
      let largeSrc = smallSrc.replace(/\.\w+$/, "-large.webp");
  
      // Update the lightbox image
      $(".lightboxImage").attr("src", largeSrc);
  }
  ,
      createLightBox(gallery, lightboxId, navigation) {
        gallery.append(`
          <div class="modal fade" id="${lightboxId ? lightboxId : "galleryLightbox"}" 
              tabindex="-1" role="dialog" aria-hidden="true">
              <div class="modal-dialog" role="document">
                  <div class="modal-content">
                      <div class="modal-body">
                          ${navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>' : '<span style="display:none;" />'}
                          <img class="lightboxImage img-fluid" alt="Displayed image in modal"/>
                          ${navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">></div>' : '<span style="display:none;" />'}
                      </div>
                  </div>
              </div>
          </div>
      `);
      },
      showItemTags(gallery, position, tags) {
        var tagItems =
          '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
        $.each(tags, function(index, value) {
          tagItems += `<li class="nav-item active">
                  <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
        });
        var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;
  
        if (position === "bottom") {
          gallery.append(tagsRow);
        } else if (position === "top") {
          gallery.prepend(tagsRow);
        } else {
          console.error(`Unknown tags position: ${position}`);
        }
      },
      filterByTag() {
        if ($(this).hasClass("active-tag")) {
          return;
        }
        $(".active-tag").removeClass("active active-tag");
        $(this).addClass("active active-tag");
  
        var tag = $(this).data("images-toggle");
  
        $(".gallery-item").each(function() {
          $(this)
            .parents(".item-column")
            .hide();
          if (tag === "all") {
            $(this)
              .parents(".item-column")
              .show(300);
          } else if ($(this).data("gallery-tag") === tag) {
            $(this)
              .parents(".item-column")
              .show(300);
          }
        });
      }
    };
  })(jQuery);
  