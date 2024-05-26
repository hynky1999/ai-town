import clsx from 'clsx';
import { MouseEventHandler, ReactNode } from 'react';

export default function Button(props: {
  className?: string;
  href?: string;
  imgUrl?: string;
  onClick?: MouseEventHandler;
  title?: string;
  children: ReactNode;
  selected?: boolean;
  disabled?: boolean;
}) {
  return (
    <a
      className={clsx(
        'button text-white bg-clay-700 rounded shadow-solid text-xl pointer-events-auto',
        props.className,
        props.selected && 'button-selected',
        props.disabled && 'disabled',
      )}
      href={props.href}
      title={props.title}
      onClick={props.onClick}
    >
      <div className="w-full bg-clay-700">
        <div className="flex justify-center items-center h-full w-full gap-5">
          {props.imgUrl && <img className="w-4 h-4 sm:w-[30px] sm:h-[30px]" src={props.imgUrl} />}
          {props.children}
        </div>
      </div>
    </a>
  );
}
