import type { Meta, StoryObj } from '@storybook/vue3'
import { VBtn } from './VBtn'
import type { StoryProps } from '../../stories/StoryProps'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Components/Button',
  component: VBtn,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],

  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },

  render: (args) => ({
    setup() {
      return { args }
    },
    components: { VBtn },
    template: `
      <VBtn v-bind="args">{{ args.text }}</VBtn>
    `,
  }),
} satisfies Meta<typeof VBtn>

export default meta
type Story = StoryObj<typeof meta & StoryProps<{ text: string, primary: boolean }>>
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  args: {
    primary: true,
    text: 'Button',
  },
}

export const Secondary: Story = {
  args: {
    primary: false,
    text: 'Button',
  },
}

export const Transparent: Story = {
  args: {
    text: 'Transparent',
    transparent: true,
  },
}

export const Icon: Story = {
  args: {
    text: 'Icon',
    icon: 'Public',
  },
}

export const IconOnly: Story = {
  args: {
    icon: 'Public',
  },
}
