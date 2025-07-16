import { defineType, defineField, defineArrayMember } from 'sanity';
import { TagIcon } from '@sanity/icons';

export const marketplaceItemType = defineType({
  name: 'marketplaceItem',
  title: 'Marketplace Item',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: Rule => Rule.required().min(4).max(80).warning('Keep titles concise and descriptive.'),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 5,
      validation: Rule => Rule.required().min(10).warning('Description should be at least 10 characters.'),
    }),
    defineField({
      name: 'price',
      type: 'number',
      validation: Rule => Rule.required().min(0).error('Price is required and must be non-negative'),
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          { title: 'Electronics', value: 'electronics' },
          { title: 'Books', value: 'books' },
          { title: 'Clothing', value: 'clothing' },
          { title: 'Furniture', value: 'furniture' },
          { title: 'Other', value: 'other' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required().error('Category is required'),
    }),
    defineField({
      name: 'condition',
      type: 'string',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Like New', value: 'like-new' },
          { title: 'Good', value: 'good' },
          { title: 'Fair', value: 'fair' },
          { title: 'Poor', value: 'poor' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required().error('Condition is required'),
    }),
    defineField({
      name: 'images',
      type: 'array',
      of: [defineArrayMember({ type: 'image', options: { hotspot: true } })],
      validation: Rule => Rule.required().min(1).error('At least one image is required'),
    }),
    defineField({
      name: 'seller',
      type: 'reference',
      to: [{ type: 'user' }],
      validation: Rule => Rule.required().error('Seller is required'),
    }),
    defineField({
      name: 'isActive',
      type: 'boolean',
      initialValue: true,
      hidden: true,
    }),
    defineField({
      name: 'createdAt',
      type: 'datetime',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'updatedAt',
      type: 'datetime',
      readOnly: true,
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'images.0',
      subtitle: 'category',
    },
  },
}); 