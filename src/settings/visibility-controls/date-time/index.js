/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { ToggleControl, Slot } from '@wordpress/components';

/**
 * Internal dependencies
 */
import InformationPopover from './../../utils/information-popover';

/**
 * Renders the date/time control settings.
 *
 * @since 1.4.0
 * @param {Object} props All the props passed to this function
 * @return {string}		 Return the rendered JSX
 */
export default function DateTime( props ) {
	const { settings, setSettings, setHasUpdates } = props;

	// Manually set defaults, this ensures the main settings function properly
	const enable = settings?.date_time?.enable ?? true; // eslint-disable-line

	return (
		<div className="setting-tabs__settings-panel">
			<div className="settings-panel__header">
				<span className="settings-panel__header-title">
					{ __( 'Date & Time', 'block-visibility' ) }
				</span>
				<InformationPopover
					message={ __(
						'To learn more about the Date & Time control, review the plugin documentation using the link below.',
						'block-visibility'
					) }
					link="https://www.blockvisibilitywp.com/documentation/visibility-controls/?utm_source=plugin&utm_medium=settings&utm_campaign=plugin_referrals"
				/>
			</div>
			<div className="settings-panel__container">
				<div className="settings-type__toggle">
					<ToggleControl
						label={ __(
							'Enable the ability to restrict block visibility based on date and time settings.',
							'block-visibility'
						) }
						checked={ enable }
						onChange={ () => {
							setSettings( {
								...settings,
								date_time: {
									...settings.date_time,
									enable: ! enable,
								},
							} );
							setHasUpdates( true );
						} }
					/>
				</div>
				<Slot name="DateTimeControls" />
			</div>
		</div>
	);
}