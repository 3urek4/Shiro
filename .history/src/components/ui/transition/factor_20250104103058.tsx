'use client'

// factor.ts
import { forwardRef, memo, useState } from 'react'
import { m } from 'motion/react'
import type { HTMLMotionProps, MotionProps, Target, TargetAndTransition, Spring } from 'motion/react'
import type { PropsWithChildren, RefAttributes, ForwardRefExoticComponent } from 'react'
import type { BaseTransitionProps } from './typings'

interface TransitionViewParams {
  from: Target
  to: Target
  initial?: Target
  preset?: Spring
}

export const createTransitionView = (params: TransitionViewParams) => {
  const { from, to, initial, preset } = params

  // 注意这里明确传递 ref 类型
  const TransitionView = forwardRef<HTMLElement, PropsWithChildren<BaseTransitionProps>>(
    (props, ref) => {
      const {
        timeout = {},
        duration = 0.5,
        animation = {},
        as = 'div',
        delay = 0,
        lcpOptimization = false,
        ...rest
      } = props

      const { enter = delay, exit = delay } = timeout

      const MotionComponent = m[as] as ForwardRefExoticComponent<HTMLMotionProps<any> & RefAttributes<HTMLElement>>

      const motionProps: MotionProps = {
        initial: initial || from,
        animate: {
          ...to,
          transition: {
            duration,
            ...(preset || microReboundPreset),
            ...animation.enter,
            delay: enter / 1000,
          },
        },
        transition: {
          duration,
        },
        exit: {
          ...from,
          transition: {
            duration,
            ...animation.exit,
            delay: exit / 1000,
          } as TargetAndTransition['transition'],
        },
      }

      if (lcpOptimization && !isHydrationEnded) {
        motionProps.initial = to
        delete motionProps.animate
      }

      return <MotionComponent ref={ref} {...motionProps} {...rest}>{props.children}</MotionComponent>
    }
  )

  // 设置 displayName 便于调试
  TransitionView.displayName = `forwardRef(TransitionView)`
  
  // 使用 memo 优化组件
  const MemoedTransitionView = memo(TransitionView)

  // 返回类型是 React.memo 包裹的 forwardRef 组件
  return MemoedTransitionView as React.MemoExoticComponent<React.ForwardRefExoticComponent<PropsWithChildren<BaseTransitionProps>>>
}
