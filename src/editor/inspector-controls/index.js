/**
 * External dependencies
 */
import { assign, isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { withFilters } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import ControlsPanel from './controls-panel';
import hasVisibilityControls from './../utils/has-visibility-controls';
import hasPermission from './../utils/has-permission';
import getEnabledControls from './../../utils/get-enabled-controls';

// Provides an entry point to slot in additional settings. Must be placed
// outside of function to avoid unnecessary rerenders.
const AdditionalInspectorControls = withFilters(
	'blockVisibility.addInspectorControls'
)( ( props ) => <></> ); // eslint-disable-line

/**
 * Add the Visibility inspector control to each allowed block in the editor
 *
 * @since 1.0.0
 * @param {Object} props All the props passed to this function
 * @return {string}		 Return the rendered JSX
 */
function VisibilityInspectorControls( props ) {
	const {
		attributes,
		globallyRestricted,
		name,
		setAttributes,
		settings,
		variables,
		widgetAreaRestricted,
	} = props;

	if ( settings === 'fetching' || variables === 'fetching' ) {
		return null;
	}

	// There are a few core blocks that are not compatible either globally or
	// specifically in the block-based Widget Editor.
	if (
		( widgetAreaRestricted.includes( name ) &&
			variables?.isWidgetEditor ) ||
		globallyRestricted.includes( name )
	) {
		return null;
	}

	// Does the user haver permission to edit visibility settings and
	// does the block type have visibility controls?
	if (
		! hasPermission( settings, variables ) ||
		! hasVisibilityControls( settings, name )
	) {
		return null;
	}

	let enabledControls = getEnabledControls( settings, variables );
	const defaultControlSettings =
		settings?.plugin_settings?.default_controls ?? [];
	const defaultControls = [];

	if ( ! isEmpty( defaultControlSettings ) ) {
		enabledControls.forEach( ( control ) => {
			if ( defaultControlSettings.includes( control.settingSlug ) ) {
				defaultControls.push[ control.attributeSlug ];
			}
		} );
	}

	let blockAtts = attributes?.blockVisibility;
	let controlSets = blockAtts?.controlSets ?? [];

	// Create the default control set if none exist.
	if ( controlSets.length === 0 ) {
		const defaultControlSet = [
			{
				id: 1,
				enable: true,
				controls: Object.fromEntries(
					defaultControls.map( ( control ) => [ control, {} ] )
				),
			},
		];
		controlSets = defaultControlSet;
		blockAtts = assign( { ...blockAtts }, { controlSets } );
	}

	// If Pro is active, allow local controls to be disabled in Pro.
	const enableLocalControls = variables?.is_pro
		? settings?.visibility_controls?.general?.enable_local_controls ?? true
		: true;

	// If local controls have been disabled, remove them from the array.
	if ( ! enableLocalControls ) {
		enabledControls = enabledControls.filter(
			( control ) =>
				control.attributeSlug === 'hideBlock' ||
				control.attributeSlug === 'visibilityPresets'
		);
	}

	// Set the control set attributes. This will need to be updated
	// if multiple control sets are enabled.
	function setControlSetAtts( controlSetAtts ) {
		setAttributes( {
			blockVisibility: assign(
				{ ...attributes.blockVisibility },
				{ controlSets: [ ...[ controlSetAtts ] ] } // Ok for now since only one control set available.
			),
		} );
	}

	return (
		// Note that the core InspectorControls component is already making use
		// of SlotFill, and is "inside" of a <SlotFillProvider> component.
		// Therefore we can freely use SlofFill without needing to add the
		// provider ourselves.
		<InspectorControls>
			<div className="block-visibility__controls-panel">
				<ControlsPanel
					controlSets={ controlSets }
					controlSetAtts={ controlSets[ 0 ] } // Ok for now since only one control set available.
					setControlSetAtts={ setControlSetAtts }
					enabledControls={ enabledControls }
					defaultControls={ defaultControls }
					{ ...props }
				/>
			</div>
			<AdditionalInspectorControls
				blockAtts={ blockAtts }
				enabledControls={ enabledControls }
				{ ...props }
			/>
		</InspectorControls>
	);
}

export default withSelect( ( select ) => {
	const { getEntityRecord } = select( 'core' );
	const { getBlocks } = select( 'core/block-editor' );

	const settings =
		getEntityRecord( 'block-visibility/v1', 'settings' ) ?? 'fetching';
	let variables =
		getEntityRecord( 'block-visibility/v1', 'variables' ) ?? 'fetching';

	// Determine if we are in the Widget Editor (Not the best but all we got).
	const widgetAreas = getBlocks().filter(
		( block ) => block.name === 'core/widget-area'
	);

	// If variables have been fetched, append the Widget Area flag.
	if ( variables !== 'fetching' ) {
		variables = { ...variables, isWidgetEditor: widgetAreas.length > 0 };
	}

	return { settings, variables };
} )( VisibilityInspectorControls );
