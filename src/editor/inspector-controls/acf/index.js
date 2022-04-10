/**
 * External dependencies
 */
import { assign } from 'lodash';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Button, Notice, ToggleControl } from '@wordpress/components';
import { Icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import icons from './../../../utils/icons';
import RuleSets from './../utils/rule-sets';
import { getGroupedFields, getAllFields } from './fields';
import InformationPopover from './../../../utils/components/information-popover';

/**
 * Add the ACF controls
 *
 * @since 1.8.0
 * @param {Object} props All the props passed to this function
 * @return {string}		 Return the rendered JSX
 */
export default function ACF( props ) {
	const {
		variables,
		enabledControls,
		controlSetAtts,
		setControlAtts,
	} = props;
	const pluginActive = variables?.integrations?.acf?.active ?? false;
	const controlEnabled = enabledControls.some(
		( control ) => control.settingSlug === 'acf'
	);
	const controlToggledOn =
		controlSetAtts?.controls.hasOwnProperty( 'acf' ) ?? false;

	if ( ! controlEnabled || ! controlToggledOn || ! pluginActive ) {
		return null;
	}

	const fields = variables?.integrations?.acf?.fields ?? [];
	const acf = controlSetAtts?.controls?.acf ?? {};
	const hideOnRuleSets = acf?.hideOnRuleSets ?? false;
	let ruleSets = acf?.ruleSets ?? [];

	// Hande the deprecated ruleSet structue in v1.8 and lower.
	if ( ruleSets.length === 0 ) {
		ruleSets.push( {
			enable: true,
			rules: [ { field: '' } ],
		} );
	} else if ( ruleSets.length === 1 && ! ruleSets[ 0 ]?.rules ) {
		const rules = ruleSets[ 0 ];

		if ( rules.length !== 0 ) {
			rules.forEach( ( rule ) => {
				const operator = rule?.operator ?? '';

				if ( operator === '!=empty' ) {
					rule.operator = 'notEmpty';
				} else if ( operator === '==empty' ) {
					rule.operator = 'empty';
				} else if ( operator === '==' ) {
					rule.operator = 'equal';
				} else if ( operator === '!=' ) {
					rule.operator = 'notEqual';
				} else if ( operator === '==contains' ) {
					rule.operator = 'contains';
				} else if ( operator === '!=contains' ) {
					rule.operator = 'notContain';
				} else {
					rule.operator = '';
				}
			} );
		}

		ruleSets = [ { enable: true, rules } ];
	}

	const addRuleSet = () => {
		const newRuleSets = [
			...ruleSets,
			{
				enable: true,
				rules: [ { field: '' } ],
			},
		];

		setControlAtts(
			'acf',
			assign( { ...acf }, { ruleSets: [ ...newRuleSets ] } )
		);
	};

	const groupedFields = getGroupedFields( variables );
	const allFields = getAllFields( variables );

	return (
		<>
			<div className="visibility-control__group acf-control">
				<h3 className="visibility-control__group-heading has-icon">
					<Icon icon={ icons.acf } />
					<span>
						{ __( 'Advanced Custom Fields', 'block-visibility' ) }
					</span>
					<InformationPopover
						message={ __(
							'The Advanced Custom Fields (ACF) control allows you configure block visibility based on a variety of field-related rules, which form rule sets.',
							'block-visibility'
						) }
						link="https://www.blockvisibilitywp.com/knowledge-base/how-to-use-the-advanced-custom-fields-control/?bv_query=learn_more&utm_source=plugin&utm_medium=settings&utm_campaign=plugin_referrals"
						position="bottom center"
					/>
				</h3>
				<div className="visibility-control__help">
					{ sprintf(
						// Translators: Whether the block is hidden or visible.
						__(
							'%s the block if at least one rule set applies. Rules targeting user fields will fail if the current user is not logged in.',
							'block-visibility'
						),
						hideOnRuleSets
							? __( 'Hide', 'block-visibility' )
							: __( 'Show', 'block-visibility' )
					) }
				</div>
				{ fields.length === 0 && (
					<Notice status="warning" isDismissible={ false }>
						{ __(
							'It does not appear that your website contains any published fields yet.',
							'block-visibility'
						) }
					</Notice>
				) }
				<div className="rule-sets">
					{ ruleSets.map( ( ruleSet, ruleSetIndex ) => {
						return (
							<RuleSets
								key={ ruleSetIndex }
								ruleSet={ ruleSet }
								ruleSetIndex={ ruleSetIndex }
								ruleSets={ ruleSets }
								groupedFields={ groupedFields }
								allFields={ allFields }
								controlName="acf"
								controlAtts={ acf }
								hideOnRuleSets={ hideOnRuleSets }
								rulePlaceholder={ __(
									'Select Field…',
									'block-visibility'
								) }
								{ ...props }
							/>
						);
					} ) }
				</div>
				<div className="rule-sets__add-rule-set">
					<Button onClick={ () => addRuleSet() } isSecondary>
						{ __( 'Add rule set', 'block-visibility' ) }
					</Button>
				</div>
				<div className="hide-on-rule-sets">
					<ToggleControl
						label={ __(
							'Hide when rules apply',
							'block-visibility'
						) }
						checked={ hideOnRuleSets }
						onChange={ () =>
							setControlAtts(
								'acf',
								assign(
									{ ...acf },
									{ hideOnRuleSets: ! hideOnRuleSets }
								)
							)
						}
					/>
				</div>
			</div>
			<div className="control-separator">
				<span>{ __( 'AND', 'block-visibility' ) }</span>
			</div>
		</>
	);
}
