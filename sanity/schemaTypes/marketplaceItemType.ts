import { defineField, defineType } from 'sanity';

export const marketplaceItemType = defineType({
  name: 'marketplaceItem',
  title: 'Marketplace Item',
  type: 'document',
  icon: () => '💸',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      description: 'Title of the item',
      validation: Rule => Rule.required().max(100).error('Title is required and should be under 100 characters'),
    }),
    defineField({
      name: 'description',
      type: 'text',
      description: 'Detailed description of the item',
      validation: Rule => Rule.required().min(10).error('Description is required and should be at least 10 characters'),
    }),
    defineField({
      name: 'price',
      type: 'number',
      description: 'Price in AUD',
      validation: Rule => Rule.required().min(0).error('Price is required and must be positive'),
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          { title: 'Books', value: 'books' },
          { title: 'Electronics', value: 'electronics' },
          { title: 'Furniture', value: 'furniture' },
          { title: 'Clothing', value: 'clothing' },
          { title: 'Other', value: 'other' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required().error('Category is required'),
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: { hotspot: true },
      description: 'Photo of the item',
      validation: Rule => Rule.required().error('Image is required'),
    }),
    defineField({
      name: 'condition',
      type: 'string',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Used', value: 'used' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required().error('Condition is required'),
    }),
    defineField({
      name: 'status',
      type: 'string',
      options: {
        list: [
          { title: 'Available', value: 'available' },
          { title: 'Sold', value: 'sold' },
        ],
        layout: 'radio',
      },
      initialValue: 'available',
      validation: Rule => Rule.required().error('Status is required'),
    }),
    defineField({
      name: 'seller',
      type: 'reference',
      to: [{ type: 'user' }],
      description: 'The user selling this item',
      validation: Rule => Rule.required().error('Seller is required'),
    }),
    defineField({
      name: 'createdAt',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      description: 'Listing creation date',
      validation: Rule => Rule.required(),
    }),
  ],
}); 