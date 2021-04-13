/**
 * External dependencies
 */
import { assign } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	Button,
	Disabled,
	Notice,
	Slot,
	Popover,
	TextControl,
	ToggleControl,
	withFilters,
} from '@wordpress/components';
import { settings } from '@wordpress/icons';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import CalendarPopover from './calendar-popover';
import DateTimeField from './date-time-field';
import formatDateLabel from './format-date-label';

/**
 * Add the block Schedule component.
 *
 * @since 1.8.0
 * @param {Object} props All the props passed to this function
 * @return {string}		 Return the rendered JSX
 */
export default function Schedule( props ) {
	const {
		dateTime,
		schedules,
		scheduleIndex,
		scheduleAtts,
		setControlAtts,
		hideOnSchedules,
	} = props;
	const [ startPickerOpen, setStartPickerOpen ] = useState( false );
	const [ endPickerOpen, setEndPickerOpen ] = useState( false );
	const [ settingsPopoverOpen, setSettingsPopoverOpen ] = useState( false );

	const title = scheduleAtts?.title ?? '';
	const enable = scheduleAtts?.enable ?? true;
	const start = scheduleAtts?.start ?? null;
	const end = scheduleAtts?.end ?? null;

	const today = new Date( new Date().setHours( 0, 0, 0, 0 ) );

	const scheduleTitle = title ? title : __( 'Schedule', 'block-visibility' );
	const startDateLabel = formatDateLabel(
		start,
		__( 'Now', 'block-visibility' )
	);
	const endDateLabel = formatDateLabel(
		end,
		__( 'Never', 'block-visibility' )
	);

	// If there is no start date/time selected, but there is an end, default the
	// starting selection in the calendar to the day prior.
	const selectedStart = ( _start, _end, _today ) => {
		if ( _start ) {
			return _start;
		}

		const startAlt = _end ? new Date( _end ) : new Date( _today );

		if ( _end ) {
			startAlt.setHours( 0, 0, 0, 0 );
			startAlt.setDate( startAlt.getDate() - 1 );
		}

		return startAlt;
	};

	// If there is no end date/time selected, but there is a start, default the
	// starting selection in the calendar to the next day.
	const selectedEnd = ( _start, _end, _today ) => {
		if ( _end ) {
			return _end;
		}

		const endAlt = _start ? new Date( _start ) : new Date( _today );
		endAlt.setHours( 0, 0, 0, 0 );
		endAlt.setDate( endAlt.getDate() + 1 );

		return endAlt;
	};

	// If the start time is greater or equal to the end time, display a warning.
	let alert = false;
	if ( start && end ) {
		alert = start >= end ? true : false;
	}

	const removeSchedule = () => {
		const newSchedules = schedules.filter(
			( value, index ) => index !== scheduleIndex
		);

		setControlAtts(
			'dateTime',
			assign( { ...dateTime }, { schedules: newSchedules } )
		);
	};

	const setAttribute = ( attribute, value ) => {
		scheduleAtts[ attribute ] = value;
		schedules[ scheduleIndex ] = scheduleAtts;

		setControlAtts( 'dateTime', assign( { ...dateTime }, { schedules } ) );
	};

	// Provides an entry point to slot in additional settings.
	const AdditionalScheduleControls = withFilters(
		'blockVisibility.addScheduleControls'
	)( ( props ) => <></> ); // eslint-disable-line

	let dateTimeFields = (
		<div className="date-time-control__schedule--date-time-fields">
			<div className="visibility-control__label">
				{ hideOnSchedules
					? __( 'Stop showing', 'block-visibility' )
					: __( 'Start showing', 'block-visibility' ) }
			</div>
			<DateTimeField
				label={ startDateLabel }
				title={ __( 'Choose a start date/time', 'block-visibility' ) }
				hasDateTime={ start }
				onOpenPopover={ setStartPickerOpen }
				onClearDateTime={ () => setAttribute( 'start', '' ) }
			/>
			{ startPickerOpen && (
				<CalendarPopover
					label={ __( 'Start Date/Time', 'block-visibility' ) }
					currentDate={ selectedStart( start, end, today ) }
					onDateChange={ ( date ) => setAttribute( 'start', date ) }
					isOpen={ setStartPickerOpen }
					highlightedDate={ end }
				/>
			) }
			<div className="visibility-control__label">
				{ hideOnSchedules
					? __( 'Resume showing', 'block-visibility' )
					: __( 'Stop showing', 'block-visibility' ) }
			</div>
			<DateTimeField
				label={ endDateLabel }
				title={ __( 'Choose an end date/time', 'block-visibility' ) }
				hasDateTime={ end }
				onOpenPopover={ setEndPickerOpen }
				onClearDateTime={ () => setAttribute( 'end', '' ) }
			/>
			{ endPickerOpen && (
				<CalendarPopover
					label={ __( 'End Date/Time', 'block-visibility' ) }
					currentDate={ selectedEnd( start, end, today ) }
					onDateChange={ ( date ) => setAttribute( 'end', date ) }
					isOpen={ setEndPickerOpen }
					highlightedDate={ start }
				/>
			) }
			{ alert && (
				<Notice status="warning" isDismissible={ false }>
					{ __(
						'The start time is after the stop time. Please fix for date/time settings to function properly.',
						'block-visibility'
					) }
				</Notice>
			) }
		</div>
	);

	if ( ! enable ) {
		dateTimeFields = <Disabled>{ dateTimeFields }</Disabled>;
	}

	return (
		<div
			className={ classnames( 'date-time-control__schedule', {
				disabled: ! enable,
			} ) }
		>
			<Slot name="ScheduleControlsTop" />
			<div className="date-time-control__schedule--heading">
				<span>{ scheduleTitle }</span>
				<div>
					<Button
						label={ __( 'Schedule Settings', 'block-visibility' ) }
						icon={ settings }
						onClick={ () =>
							setSettingsPopoverOpen( ( open ) => ! open )
						}
						isSmall
					/>
					{ settingsPopoverOpen && (
						<Popover
							className="block-visibility__control-popover schedule-settings"
							focusOnMount="container"
							onClose={ () => setSettingsPopoverOpen( false ) }
						>
							<h3>
								{ __(
									'Schedule Settings',
									'block-visibility'
								) }
							</h3>
							<TextControl
								value={ title }
								label={ __(
									'Schedule Title',
									'block-visibility'
								) }
								placeholder={ __(
									'Schedule',
									'block-visibility'
								) }
								help={ __(
									'Optionally set a descriptive schedule title.',
									'block-visibility'
								) }
								onChange={ ( value ) =>
									setAttribute( 'title', value )
								}
							/>
							<ToggleControl
								label={ __(
									'Enable schedule',
									'block-visibility'
								) }
								checked={ enable }
								onChange={ () =>
									setAttribute( 'enable', ! enable )
								}
								help={ __(
									'Enable or disable the selected schedule.',
									'block-visibility'
								) }
							/>
						</Popover>
					) }
				</div>
			</div>
			{ dateTimeFields }
			<Slot name="ScheduleControlsBottom" />
			<div className="date-time-control__schedule--remove">
				{ schedules.length >= 2 && (
					<Button
						onClick={ () => removeSchedule() }
						isTertiary
						isDestructive
					>
						{ __( 'Remove', 'block-visibility' ) }
					</Button>
				) }
			</div>
			<AdditionalScheduleControls { ...props } />
		</div>
	);
}