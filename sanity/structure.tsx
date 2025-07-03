import type { StructureResolver } from "sanity/structure";
import { BasketIcon } from '@sanity/icons';

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Marketplace")
        .icon(BasketIcon)
        .child(
          S.documentTypeList("marketplaceItem")
            .title("Marketplace Items")
        ),
      ...S.documentTypeListItems(),
      // add reported section
      S.listItem()
        .title("Reported")
        .icon(() => "🚩")
        .child(
          S.list()
            .title("Reported Content to be reviewed")
            .items([
              S.listItem()
                .title("Posts")
                .child(
                  S.documentTypeList("post")
                    .title("Reported Posts")
                    .filter('_type == "post" && status == "reported"')
                ),
              S.listItem()
                .title("Comments")
                .child(
                  S.documentTypeList("comment")
                    .title("Reported Comments")
                    .filter('_type == "comment" && status == "reported"')
                ),
              S.listItem()
                .title("Users")
                .child(
                  S.documentTypeList("user")
                    .title("Reported Users")
                    .filter('_type == "user" && status == "reported"')
                    .child((userId) =>
                      S.list()
                        .title("User Options")
                        .items([
                          S.listItem()
                            .title("User Details")
                            .child(
                              S.document().schemaType("user").documentId(userId)
                            ),
                          S.listItem()
                            .title("Reported Posts by this user")
                            .child(
                              S.documentList()
                                .title("Reported Posts")
                                .filter(
                                  '_type == "post" && author._ref == $userId && status == "reported"'
                                )
                                .params({ userId })
                            ),
                        ])
                    )
                ),
            ])
        ),
    ]);
